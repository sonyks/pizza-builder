import { Recipe } from '../recipe.model';
import * as fromRecipes from './recipe.actions';

export interface State {
    recipes: Recipe[];
}

const initialState: State = {
    recipes: []
};
export function recipeReducer(state = initialState, action: fromRecipes.RecipesActions) {
    switch (action.type) {
        case fromRecipes.SET_RECIPES: {
            return {
                ...state,
                recipes: [...action.payload]
            };
        }
        case fromRecipes.ADD_RECIPE:
            return {
                ...state,
                recipes: [...state.recipes, action.payload]
            };
        case fromRecipes.UPDATE_RECIPE:
            const updatedRecipe = { ...state.recipes[action.payload.index],
                ...action.payload.newRecipe
            };
            const updatedRecipes = [...state.recipes];
            updatedRecipes[action.payload.index] = updatedRecipe;
            return {
                ...state,
                recipes: updatedRecipes
            };
        case fromRecipes.DELETE_RECIPE:
            return {
                ...state,
                recipes: state.recipes.filter((_, index) => {
                    return index !== action.payload;
                })
            };
        default:
            return state;
    }
}
