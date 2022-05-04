import { Species } from "models/Species";
import { Stat } from "models/Stat";

export interface ApiParams {
  name: string;
}

type UrlName = Record<"string" | "url", string>;

type Ability = {
  ability: UrlName;
  is_hidden: boolean;
  slot: number;
};

type GameIndice = {
  game_indice: number;
  version: UrlName;
};

type HeldItem = {
  item: UrlName;
  version_details: {
    rarity: number;
    version: UrlName;
  }[];
};

type PMove = {
  move: UrlName;
  version_group_details: {
    level_learned_at: number;
  }[];
  move_learn_method: UrlName;
  version_group: UrlName;
};

type Sprites = {
  back_default?: string;
  back_female?: string;
  back_shiny?: string;
  back_shiny_female?: string;
  front_default?: string;
  front_female?: string;
  front_shiny?: string;
  front_shiny_female?: string;
  other: {
    dream_world?: {
      front_default?: string;
      front_female?: string;
    };
    home?: {
      front_default?: string;
      front_female?: string;
      front_shiny?: string;
      front_shiny_female?: string;
    };
    "official-artwork": {
      front_default: string;
    };
    versions?: {
      [value: string]: {
        [value: string]: {
          back_default?: string;
          back_gray?: string;
          back_transparent?: string;
          front_default?: string;
          front_gray?: string;
          front_transparent?: string;
        };
      };
    };
  };
};

type PType = {
  slot: number;
  type: UrlName;
};

export interface IPokemon {
  id: number;
  is_default: boolean;
  location_area_encounters: string;
  height: number;
  base_experience: number;
  name: string;
  order: number;
  past_types: PType[];
  weight: number;

  abilities: Ability[];
  forms: UrlName[];
  game_indices: GameIndice[];
  held_items: HeldItem[];
  moves: PMove[];
  species: Species;
  sprites: Sprites;
  stats: Stat[];
  types: PType[];
}
