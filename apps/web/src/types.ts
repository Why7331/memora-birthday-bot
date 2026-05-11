export type Birthday = {
  id: number;
  user_id: number;
  name: string;
  relation: string;
  birth_date: string;
  note: string | null;
  gift_idea: string | null;
  created_at: string;
  updated_at: string;
};

export type BirthdayForm = {
  name: string;
  relation: string;
  birth_date: string;
  note: string;
  gift_idea: string;
};

export type Me = {
  user: {
    id: number;
    telegram_id: number;
    first_name: string | null;
    username: string | null;
    created_at: string;
  };
};
