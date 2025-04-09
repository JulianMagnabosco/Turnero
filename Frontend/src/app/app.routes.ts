import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { PasswordComponent } from './components/password/password.component';
import { authGuard, authGuardAdmin } from './guards/auth.guard';
import { UsersComponent } from './components/users/users.component';
import { ShowUserComponent } from './components/show-user/show-user.component';
import { DisplayListComponent } from './components/display-list/display-list.component';
import { ManageListComponent } from './components/manage-list/manage-list.component';

export const routes: Routes = [
    {path:"",component:HomeComponent},
    {path:"login",component:LoginComponent, title:"Iniciar Secion"},
    {path:"password",component:PasswordComponent, title:"Cambiar Contraseña"},
    {path:"display",component:DisplayListComponent, title:"Mostrar"},

    {path:"showuser",component:ShowUserComponent, title:"Usuario", canActivate:[authGuard]},
    {path:"register",component:RegisterComponent, title:"Registo", canActivate:[authGuardAdmin]},
    {path:"users",component:UsersComponent, title:"Usuarios", canActivate:[authGuardAdmin]},

    {path:"manage",component:ManageListComponent, title:"Gestion listas", canActivate:[authGuardAdmin]},
    {path:"**", redirectTo:""},
];
