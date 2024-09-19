// utils.ts
import { Schema } from "@/amplify/data/resource";
import { convertToCapitalCase } from "../format";
import { generateClient } from "@aws-amplify/api";
import { configureAmplify } from "../amplifyInit";
import { Countries, HeartSites, Regions } from "@/API";
// TODO: refactor after schema updated to countries/regions

export type DropdownOption = {
  label: string;
  value: string;
};

export const heartSiteArray = Object.values(HeartSites);

export const countriesArray = Object.values(Countries);

export const regionsArray = Object.values(Regions);


export const countriesForDropdown = countriesArray.map((item) => ({
  label: convertToCapitalCase(item),
  value: item.toString()
}));

export const regionsForDropdown = regionsArray.map(item => ({
  label: convertToCapitalCase(item),
  value: item.toString()
}));

export const workerTypesForDropdown = () => {
  console.log("workerType");
}

export const getRegionsForCountry = async (country: Countries) => {
  return regionsArray
    .filter(region => region.startsWith(country))
    .map(region => {
      const regionName = region.split("__")[1];
      return {
        label: convertToCapitalCase(regionName),
        value: regionName
      };
    });
};
