import { Actions, Effect, ofType } from "@ngrx/effects";
import * as RecipesActions from './recipe.actions'
import { switchMap, map, withLatestFrom } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Recipe } from '../recipe.model';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer'

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

    @Effect({dispatch: false})
    storeRecipes = this.actions$
        .pipe(ofType(RecipesActions.STORE_RECIPES),
            withLatestFrom(this.store.select("recipes")),
            switchMap(([actionData, recipesState]) => {
                return this.httpClient.put('https://recipe-book-3c014.firebaseio.com/recipes.json', recipesState.recipes)
            }));

    constructor(private actions$: Actions,
        private httpClient: HttpClient,
        private store: Store<fromApp.AppState>) {}
}