import { AbstractControl } from '@angular/forms';

export class CustomValidators {
  static matchOther(otherControlName: string) {

    let thisControl: AbstractControl;
    let otherControl: AbstractControl | undefined;

    return (control: AbstractControl): { matchOther?: true} | null =>  {
      if (!control.parent) {
        return null;
      }

      if (!thisControl) {
        thisControl = control;
        otherControl = (control.parent.get(otherControlName) || undefined);
        if (!otherControl) {
          throw new Error("matchOther(): other control does not exist in parent group");
        }

        otherControl.valueChanges.subscribe(() => control!.updateValueAndValidity());
      }

      if (otherControl!.value !== thisControl.value) {
        return {matchOther: true};
      }

      return null;
    }
  }
}
