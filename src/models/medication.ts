export class Medication {
    _id: number;
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
      this._id = id;
      this.name = name;
      this.dosage = dosage;
      this.description = description;
      this.price = price;
    }
  }
  