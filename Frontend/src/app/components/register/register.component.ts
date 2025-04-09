import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgSwitch,NgSwitchCase,NgSwitchDefault],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit,OnDestroy{
  form:FormGroup;

  subs=new Subscription();

  tips: { errors:string[]|null, passwordPoints:number}={ errors:null,passwordPoints:0 }

  constructor(private fb: FormBuilder, protected service: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ["", [Validators.required, Validators.pattern("[a-zA-Z0-9_]*"),
                  Validators.maxLength(20 )]],
      email: ["", [Validators.required, Validators.email, Validators.maxLength(50 )]],
      password: ["", [Validators.required, Validators.pattern(/^[\S]*$/),
        Validators.maxLength(20), Validators.minLength(8)]],
      password2: ["", [Validators.required, Validators.maxLength(20)]],
      terms: [true, [Validators.requiredTrue]]
    },{
      validators: [this.checkPasswords]
    });

  }

  ngOnInit(): void {
    this.subs.add(
      this.form.valueChanges.subscribe({
        next: () =>  {
          this.test();
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onSubmit(){
    if(this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }

    let user = {
      "username": this.form.value['username'],
      "password": this.form.value['password'],
      "email": this.form.value['email'],
    }

    this.subs.add(
      this.service.registerUser(user).subscribe(
        {
          next: value => {
            alert("La usuario fue registrado con éxito")
            this.exit();
          },
          error: err => {
            alert("Error inesperado en el servidor, revise su conexion a internet");
          }
        }
      )
    );
  }
  test(){
    let user = {
      "username": this.form.controls['username'].value,
      "password": this.form.controls['password'].value,
      "email": this.form.controls['email'].value
    }
    console.log(user)
    this.subs.add(
      this.service.testRegisterUser(user).subscribe(
        {
          next: value => {
            this.tips=value;
            console.log(value)
          }
        }
      )
    );
  }

  exit(){
    this.router.navigate(["/login"]);
  }

  checkPasswords: ValidatorFn = (group: AbstractControl):  ValidationErrors | null => {
    let pass = group.get('password')?.value;
    let confirmPass = group.get('password2')?.value
    return pass === confirmPass ? null : { notSame: true }
  }
}