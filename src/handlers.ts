import { FastifyRequest, FastifyReply } from "fastify";
import { PokemonWithStats } from "models/PokemonWithStats";

import * as https from "https";

import { ApiParams, IPokemon } from "utils/types";
import {
  API_HOSTNAME,
  API_POKEMONS,
  API_LIMIT,
  API_OFFSET,
} from "utils/constants";

const keepAliveAgent = new https.Agent({ keepAlive: true });

const getApiPokemonByName = (
  ApiPokemanPath,
  headers,
  method = "GET",
  body = undefined
) => {
  // * Could be remplaced with axios
  return new Promise<IPokemon>((resolve, reject) => {
    const _req = https.request(
      {
        method,
        hostname: API_HOSTNAME,
        path: ApiPokemanPath,
        port: 443,
        headers,
        agent: keepAliveAgent,
      },
      (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error("statusCode: " + res.statusCode));
        }

        let body = [];
        res.on("data", function (chunk) {
          body.push(chunk);
        });

        res.on("end", function () {
          try {
            resolve(JSON.parse(Buffer.concat(body).toString()));
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    if (body) {
      _req.write(body);
    }

    _req.on("error", (err) => reject(err));
    _req.end();
  });
};

export const getPokemonByName = async (
  request: FastifyRequest<{ Params: ApiParams }>,
  reply: FastifyReply
) => {
  const { name } = request.params;

  reply.header("Accept", "application/json");

  const url = `${API_POKEMONS}/${encodeURIComponent(
    name.trim()
  )}?offset=${API_OFFSET}&limit=${API_LIMIT}`;

  try {
    const response: IPokemon = await getApiPokemonByName(
      url,
      reply.getHeaders()
    );
    const {
      id,
      height,
      base_experience,
      sprites: { front_default: sprite_img } = {},
      species,
      stats,
    } = response;

    const averageBaseExperience = await computeResponse(response, reply);

    // Mocking saving db entry
    new PokemonWithStats(
      name,
      height,
      base_experience,
      averageBaseExperience,
      id,
      sprite_img,
      species,
      url,
      stats
    );

    return reply
      .code(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({
        ...response,
        averageBaseExperience,
      });
  } catch {
    return reply.code(404).send({ error: "Not Found!" });
  }
};

export const computeResponse = async (
  response: IPokemon,
  reply: FastifyReply
) => {
  // * Refactoring to current API.
  // Ambiguous calculations has been removed due to next api entries.
  // Example: https://pokeapi.co/api/v2/pokemon/pikachu

  // const types = response.types?.filter(type => type.type).map(type => type.type.url);
  // const pokemonTypes = await Promise.all(types.map(async (typeUrl) => await getApiPokemonTypes(typeUrl)));

  return (
    response.stats.reduce((prev, stat) => prev + stat.base_stat, 0) /
    response.stats.length
  );
};
