import { Actions, Effect, ofType } from "@ngrx/effects";
import * as RecipesActions from './recipe.actions'
import { switchMap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Recipe } from '../recipe.model';
import { Injectable } from '@angular/core';

@Injectable()
export class RecipeEffects {
    @Effect()
    fetchRecipes = this.actions$
        .pipe(
            ofType(RecipesActions.FETCH_RECIPES),
            switchMap(() => {
                return this.httpClient.get<Recipe[]>('https://recipe-book-3c014.firebaseio.com/recipes.json')
            }),
            map(recipes => {
                return recipes.map(recipe => {
                    return {...recipe, ingredients: recipe.ingredients ? recipe.ingredients : []}
                })
            }),
            map(recipes => {
                return new RecipesActions.SetRecipes(recipes);
            }));

    constructor(private actions$: Actions,
        private httpClient: HttpClient) {}
}