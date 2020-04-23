import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Ingredient } from 'src/app/shared/ingredient.model';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as ShoppingListActions from '../store/shopping-list.actions';
import * as fromApp from '../../store/app.reducer'

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.scss']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  indexSub: Subscription;
  editMode = false;
  editedItemIndex: number;
  editedItem: Ingredient;
  @ViewChild("f") form: NgForm;

  constructor(private store: Store<fromApp.AppState>) { }
  
  ngOnDestroy(): void {
    if (this.indexSub) {
      this.indexSub.unsubscribe();
      this.store.dispatch(new ShoppingListActions.StopEdit());
    }
  }

  ngOnInit(): void {
    this.indexSub = this.store.select('shoppingList').subscribe(stateDate => {
      if (stateDate.editedIngredientIndex > -1) {
        this.editedItemIndex = stateDate.editedIngredientIndex;
        this.editMode = true;
        this.editedItem = stateDate.editedIngredient;
        this.form.setValue({
          name: this.editedItem.name,
          amount: this.editedItem.amount
        });
      } else {
        this.editMode = false;
      }
    });
  }

  onAddItem(form: NgForm) {
    const value = form.value;
    const ingredient = new Ingredient(value.name, value.amount);
    if (this.editMode) {
      this.store.dispatch(new ShoppingListActions.UpdateIngredient(ingredient));    
    } else {
      this.store.dispatch(new ShoppingListActions.AddIngredient(ingredient));
    } 
    this.editMode = false;
    this.form.reset();
  }

  onClear() {
    this.form.reset();
    this.editMode = false;
    this.store.dispatch(new ShoppingListActions.StopEdit());
  }

  onDelete() {
    this.onClear();
    if (this.editedItemIndex >= 0) {
      this.store.dispatch(new ShoppingListActions.DeleteIngredient());
    } 
  }
}
