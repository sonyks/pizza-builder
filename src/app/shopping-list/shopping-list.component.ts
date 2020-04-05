import { Component, OnInit, OnDestroy } from '@angular/core';
import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from './shopping-list.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss']
})
export class ShoppingListComponent implements OnInit, OnDestroy {

  ingredients: Ingredient[] = [];
  private igChangeSub: Subscription;
  constructor(private shoppingListService: ShoppingListService) { }
  
  ngOnDestroy(): void {
    if (this.igChangeSub) {
      this.igChangeSub.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.ingredients = this.shoppingListService.getIngredients();
    this.igChangeSub = this.shoppingListService.ingredientChanged.subscribe(changedIgredients => {
      this.ingredients = changedIgredients;
    });
  }
}
