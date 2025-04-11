import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,NgIf,RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit,OnDestroy{
  private subs: Subscription = new Subscription();
  form: FormGroup;

  constructor(private fb: FormBuilder, protected service: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ["", [Validators.required, Validators.maxLength(20 )]],
      password: ["", [Validators.required, Validators.maxLength(20)]]
    });

  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onSubmit(){
    if(this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }

    this.subs.add(
      this.service.login(this.form.value).subscribe(
        {
          next: value => {
            console.log(value)
            this.service.setData(value["user"],value["token"])

            this.router.navigate(["/home"])
          },
          error: err => {
            if(err["status"]==401){
              alert("No existe usuario con esas credenciales");
              // alert("No existe usuario con esas credenciales")
            }else {
              alert("Error inesperado en el servidor, revise su conexion a internet");
            }
          }
        }
      )
    );
  }

  exit(){
    this.router.navigate(["/register"]);
  }

  // checkPasswords: ValidatorFn = (group: AbstractControl):  ValidationErrors | null => {
  //   let pass = group.get('password')?.value;
  //   let confirmPass = group.get('password2')?.value
  //   return pass === confirmPass ? null : { notSame: true }
  // }

}
