import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { ResumeComponent } from './pages/resume/resume.component';
import { MiniSliderComponent } from './components/mini-slider/mini-slider.component';
import { KonamiDirective } from './konami.directive';
import { SecretComponent } from './pages/secret/secret.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { NavigationComponent } from './components/navigation/navigation.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    ResumeComponent,
    MiniSliderComponent,
    KonamiDirective,
    SecretComponent,
    ProjectsComponent,
    NavigationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
