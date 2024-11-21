export class Medication {
    id: number;
    name: string;
    dosage: string;
    description?: string; // Optionnel
    price?: number;       // Optionnel
  
    constructor(
      id: number,
      name: string,
      dosage: string,
      description?: string,
      price?: number
    ) {
      this.id = id;
      this.name = name;
      this.dosage = dosage;
      this.description = description;
      this.price = price;
    }
  }
  