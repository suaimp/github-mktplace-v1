// src/pages/auth/types/accountTypes.ts

export type AccountType = "advertiser"; // add more types as needed

export const accountTypes: { value: AccountType; label: string; description: string }[] = [
  {
    value: "advertiser",
    label: "Anunciante",
    description: "Crie e gerencie campanhas publicitárias"
  }
  // Future: add more account types here
];
