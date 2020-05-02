import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Recipe } from './recipe.model';
import { Observable, of } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as recipesActions from '../recipes/store/recipe.actions';
import { Actions, ofType } from '@ngrx/effects';
import { take, map, switchMap } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class RecipesResolverService implements Resolve<Recipe[]> {
    constructor(
        private store: Store<fromApp.AppState>,
        private actions$: Actions) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Recipe[] | Observable<Recipe[]> | Promise<Recipe[]> {
        return this.store.select('recipes')
            .pipe(
                take(1),
                map(recipesState => {
                return recipesState.recipes;
                }),
                switchMap(recipes => {
                    if (recipes.length === 0) {
                        this.store.dispatch(new recipesActions.FetchRecipes());
                        return this.actions$.pipe(ofType(recipesActions.SET_RECIPES),
                            take(1));
                    } else {
                        return of(recipes);
                    }

                })
            );
    }
}
