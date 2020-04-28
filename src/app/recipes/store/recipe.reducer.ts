import { Recipe } from '../recipe.model';
import * as fromRecipes from './recipe.actions';

export interface State {
    recipes: Recipe[];
}

const initialState: State = {
    recipes: []
}
export function recipeReducer(state = initialState, action: fromRecipes.RecipesActions) {
    switch (action.type) {
        case fromRecipes.SET_RECIPES: {
            return {
                ...state,
                recipes: [...action.payload]
            }
        }
        default:
            return state;
    }
}