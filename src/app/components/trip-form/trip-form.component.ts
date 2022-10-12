import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Trip } from 'src/app/models/trip.model';
import { combineLatest, debounceTime, filter } from 'rxjs';

@Component({
  selector: 'app-trip-form',
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.css'],
})
export class TripFormComponent implements OnInit {
  tripFormToEdit: Trip = {
    id: 1,
    name: 'Alon Katz',
    email: 'alon@gmail.com',
    checkEmail: 'alon@gmail.com',
    fromCountry: 'israel',
    toCountry: 'England',
    idNumber: '357458956',
  };
  tripForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.tripForm = this.formBuilder.group({
      id: [this.tripFormToEdit.id, [Validators.required]],
      name: [this.tripFormToEdit.name, [Validators.required]],
      email: [
        this.tripFormToEdit.email,
        [Validators.required, Validators.email],
      ],
      checkEmail: [
        this.tripFormToEdit.checkEmail,
        [Validators.required, Validators.email],
      ],
      fromCountry: [this.tripFormToEdit.fromCountry, [Validators.required]],
      toCountry: [this.tripFormToEdit.toCountry, [Validators.required]],
      idNumber: [
        this.tripFormToEdit.idNumber,
        [Validators.required, this.is_israeli_id_number],
      ],
    });

    combineLatest([
      this.tripForm.get('checkEmail')?.valueChanges,
      this.tripForm.get('email')?.valueChanges,
    ])
      .pipe(debounceTime(500))
      .subscribe((e: any) => {
        if (e[0] === e[1]) {
          return null;
        }
        return this.tripForm
          .get('checkEmail')
          ?.setErrors({ emails: 'not same' });
      });

    combineLatest([
      this.tripForm.get('fromCountry')?.valueChanges,
      this.tripForm.get('toCountry')?.valueChanges,
    ])
      .pipe(debounceTime(500))
      .subscribe((c: any) => {
        if (c[0] === c[1]) {
          this.tripForm
            .get('fromCountry')
            ?.setErrors({ countries: 'same countries' });
          this.tripForm
            .get('toCountry')
            ?.setErrors({ countries: 'same countries' });
        } else {
          this.tripForm.get('fromCountry')?.setErrors(null);
          this.tripForm.get('toCountry')?.setErrors(null);
        }
      });

    this.tripForm.valueChanges
      .pipe(
        filter((t) => this.tripForm.valid),
        debounceTime(500)
      )
      .subscribe((t) => {
        this.save();
      });
  }

is_israeli_id_number(id: FormControl) {
  console.log(id.value)
    let currentId: string = id.value
    currentId.trim()
    if (currentId.length > 9 ) return this.tripForm.get("idNumber")?.setErrors({"idNumber": "id is too long"});
    currentId = currentId.length < 9 ? ("00000000" + currentId).slice(-9) : currentId;
    console.log(currentId)
      const i = Array.from(currentId, Number).reduce((counter, digit, i) => {
        console.log("counter:" ,counter,"digit:", digit, i)
        const step = digit * ((i % 2) + 1);
        console.log(step)
        return counter + (step > 9 ? step - 9 : step);
      }) % 10 === 0;
      if(i) {
        return null
      } else {
        return {"idNumber" : "invalid id number"}
      }
  }

  checkEmail(email: any, checkEmail: any) {
    console.log(email);
  }

  save() {
    this.tripFormToEdit = this.tripForm.value;
  }
}
