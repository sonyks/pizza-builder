import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Recipe } from '../recipes/recipe.model';
import { RecipeService } from '../recipes/recipe.service';
import { map, tap, take, exhaustMap } from "rxjs/operators";
import { AuthService } from '../auth/auth/auth.service';

@Injectable({providedIn: 'root'})
export class DataStorageService {
    constructor(private httpClient: HttpClient,
        private recipeService: RecipeService,
        private authService: AuthService) {}

    storeRecipes() {
        const recipes = this.recipeService.getRecipes();
        this.httpClient.put('https://recipe-book-3c014.firebaseio.com/recipes.json', recipes)
            .subscribe(result => {
                console.log(result);
            });
    }

    fetchRecipes() {
        return this.httpClient.get<Recipe[]>('https://recipe-book-3c014.firebaseio.com/recipes.json')
            .pipe(
                map(recipes => {
                    return recipes.map(recipe => {
                        return {...recipe, ingredients: recipe.ingredients ? recipe.ingredients : []}
                    })
                }),
                tap(recipes => {
                    this.recipeService.setRecipes(recipes);
                }));
    }
}