export interface User {
  id: string;
  last_name: string;
  first_name: string;
  default_address: {
    city: string;
    postal_code: string;
	address_line1: string;
	address_line2: string;
	address_line3: string;
	address_line4: string;
	address_line5: string;
  };
}