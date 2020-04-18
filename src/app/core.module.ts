import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterseptorService } from './auth/auth/auth-interceptor.service';
import { ShoppingListService } from './shopping-list/shopping-list.service';
import { RecipeService } from './recipes/recipe.service';

@NgModule({
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterseptorService, multi: true}
    ]
})
export class CoreModule {

}