import { Component, OnInit, OnDestroy } from '@angular/core';
import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit, OnDestroy {
  recipesChangedSub: Subscription;
  recipes: Recipe[] = [];
  constructor(private recipeService: RecipeService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnDestroy(): void {
    if (this.recipesChangedSub) {
      this.recipesChangedSub.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.recipesChangedSub = this.recipeService.recipesChanged.subscribe((recipes: Recipe[]) => {
      this.recipes = recipes;
    });
    this.recipes = this.recipeService.getRecipes();  
  }

  onNewRecipe() {
    this.router.navigate(['new'], { relativeTo: this.route});
  }
}
