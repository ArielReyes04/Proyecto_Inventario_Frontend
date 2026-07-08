import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function ecuadorianIdValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const id = value.toString().trim();

    // Debe tener 10 (cédula) o 13 (RUC) dígitos
    if (id.length !== 10 && id.length !== 13) {
      return { invalidIdLength: true };
    }

    // Solo números
    if (!/^[0-9]+$/.test(id)) {
      return { nonNumericId: true };
    }

    const provinceCode = parseInt(id.substring(0, 2), 10);
    if (provinceCode < 1 || provinceCode > 24) {
      if (provinceCode !== 30) {
        return { invalidProvinceCode: true };
      }
    }

    const thirdDigit = parseInt(id.substring(2, 3), 10);

    // Cédula o RUC persona natural (tercer dígito < 6)
    if (thirdDigit < 6) {
      if (id.length === 13 && id.substring(10, 13) !== '001') {
        return { invalidRucSuffix: true };
      }
      
      const checkDigit = parseInt(id.substring(9, 10), 10);
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        let val = parseInt(id.charAt(i), 10);
        if (i % 2 === 0) { // Posiciones impares (índice 0, 2, 4...)
          val = val * 2;
          if (val >= 10) val = val - 9;
        }
        sum += val;
      }
      const nextMultiple10 = Math.ceil(sum / 10) * 10;
      const calculatedDigit = nextMultiple10 - sum;
      const finalDigit = calculatedDigit === 10 ? 0 : calculatedDigit;

      if (finalDigit !== checkDigit) {
        return { invalidIdCheckDigit: true };
      }
      return null;
    }
    
    // RUC Sociedad Privada o Extranjeros (tercer dígito == 9)
    else if (thirdDigit === 9) {
      if (id.length !== 13) return { invalidIdLength: true };
      
      const checkDigit = parseInt(id.substring(9, 10), 10);
      const coefficients = [4, 3, 2, 7, 6, 5, 4, 3, 2];
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(id.charAt(i), 10) * coefficients[i];
      }
      const remainder = sum % 11;
      const calculatedDigit = remainder === 0 ? 0 : 11 - remainder;

      if (calculatedDigit !== checkDigit) {
        return { invalidIdCheckDigit: true };
      }
      return null;
    }

    // RUC Entidad Pública (tercer dígito == 6)
    else if (thirdDigit === 6) {
      if (id.length !== 13) return { invalidIdLength: true };
      
      const checkDigit = parseInt(id.substring(8, 9), 10); // El noveno dígito es el verificador
      const coefficients = [3, 2, 7, 6, 5, 4, 3, 2];
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(id.charAt(i), 10) * coefficients[i];
      }
      const remainder = sum % 11;
      const calculatedDigit = remainder === 0 ? 0 : 11 - remainder;

      if (calculatedDigit !== checkDigit) {
        return { invalidIdCheckDigit: true };
      }
      return null;
    }

    // Si el tercer dígito no es <6, 6, o 9
    return { invalidThirdDigit: true };
  };
}
