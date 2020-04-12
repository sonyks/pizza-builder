import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Ingredient } from 'src/app/shared/ingredient.model';
import { ShoppingListService } from '../shopping-list.service';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

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

  constructor(private shoppingListService: ShoppingListService) { }
  
  ngOnDestroy(): void {
    if (this.indexSub) {
      this.indexSub.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.indexSub = this.shoppingListService.startingEditing.subscribe(index => {
      this.editedItemIndex = index;
      this.editMode = true;
      this.editedItem = this.shoppingListService.getIngredient(index);
      this.form.setValue({
        name: this.editedItem.name,
        amount: this.editedItem.amount
      })
    });
  }

  onAddItem(form: NgForm) {
    const value = form.value;
    const ingredient = new Ingredient(value.name, value.amount);
    this.editMode ? this.shoppingListService.updateIngredient(this.editedItemIndex, ingredient)
      : this.shoppingListService.addNewIngredient(ingredient);
    this.editMode = false;
    this.form.reset();
  }

  onClear() {
    this.form.reset();
    this.editMode = false;
  }

  onDelete() {
    this.onClear();
    if (this.editedItemIndex >= 0) {
      this.shoppingListService.deleteIngredient(this.editedItemIndex);
    } 
  }
}
