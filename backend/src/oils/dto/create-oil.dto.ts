export class CreateOilDto {
  nameRo!: string; // ! = Definite Assignment Assertion (ii spun ca va aparea la runtime)
  nameEn!: string;
  smallBottles?: number; // semnul '?' inseamna optional (default 0)
  largeBottles?: number;
}