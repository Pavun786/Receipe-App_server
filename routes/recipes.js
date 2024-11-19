// import express from 'express';
// import {pool} from '../db/dbconfig.js';
// import { verifyToken } from './users.js';

// const router = express.Router();

// // Get all recipes
// router.get('/', async (req, res) => {
//     try {
//         const recipes = await pool.query('SELECT * FROM recipes');
//         res.json(recipes.rows);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // Get a specific recipe by ID
// router.get('/:recipeID', async (req, res) => {
//     try {
//         const recipe = await pool.query('SELECT * FROM recipes WHERE id = $1', [req.params.recipeID]);
//         res.json(recipe.rows[0]);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // Save a new recipe
// router.post('/', async (req, res) => {
//     const { name, ingredients, description, instructions, imageUrl,cuisine,cookingTime, difficultyLevel,recipeOwner } = req.body;

//     try {
//         const newRecipe = await pool.query(
//             'INSERT INTO recipes (name, ingredients, description, instructions, imageUrl, cuisine,cookingTime, difficultyLevel, recipeOwner) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
//             [name, ingredients, description, instructions, imageUrl,cuisine, cookingTime, difficultyLevel,recipeOwner]
//         );
//         res.json(newRecipe.rows[0]);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // Update a recipe by ID
// router.put('/:recipeID', async (req, res) => {
//     const { name, ingredients, description, instructions, imageUrl, cookingTime, recipeOwner } = req.body;

//     try {
//         const updatedRecipe = await pool.query(
//             'UPDATE recipes SET name = $1, ingredients = $2, description = $3, instructions = $4, imageUrl = $5, cookingTime = $6, recipeOwner = $7 WHERE id = $8 RETURNING *',
//             [name, ingredients, description, instructions, imageUrl, cookingTime, recipeOwner, req.params.recipeID]
//         );
//         res.json(updatedRecipe.rows[0]);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // Delete a recipe by ID
// router.delete('/:recipeID', async (req, res) => {
//     try {
//         await pool.query('DELETE FROM recipes WHERE id = $1', [req.params.recipeID]);
//         res.status(200).json({ message: 'Recipe deleted successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// export { router as recipesRouter };



import { pool } from '../db/dbconfig.js';
import express from 'express';
const router = express.Router();

// Get all recipes
router.get('/', async (req, res) => {
    try {
        const recipes = await pool.query('SELECT * FROM recipes');
        res.json(recipes.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get a specific recipe by ID
router.get('/:recipeID', async (req, res) => {
    try {
        const recipe = await pool.query('SELECT * FROM recipes WHERE id = $1', [req.params.recipeID]);
        res.json(recipe.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Save a new recipe
router.post('/', async (req, res) => {
    let { name, ingredients, description, instructions, imageUrl, cuisine, cookingTime, difficultyLevel, recipeOwner } = req.body;

    // Ensure ingredients and instructions are arrays
    if (typeof ingredients === 'string') {
        ingredients = ingredients.split(',').map(item => item.trim());
    }

    if (typeof instructions === 'string') {
        instructions = instructions.split(',').map(item => item.trim());
    }

    try {
        const newRecipe = await pool.query(
            `INSERT INTO recipes 
            (name, ingredients, description, instructions, imageUrl, cuisine, cookingTime, difficultyLevel, recipeOwner) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *`,
            [name, ingredients, description, instructions, imageUrl, cuisine, cookingTime, difficultyLevel, recipeOwner]
        );
        res.json(newRecipe.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});


router.get("/search/:keyword/",async(req, res) => {
    console.log("exe")
    try {
      const { keyword } = req.params;
  
      // Use parameterized queries to avoid SQL injection
      const results = await pool.query(
        `SELECT * FROM recipes 
         WHERE 
         (name ILIKE $1 OR description ILIKE $1 OR cuisine ILIKE $1)`,
        [`%${keyword}%`]
      );
  
      res.status(200).send(results.rows);
    } catch (error) {
      res.status(400).send({
        success: false,
        message: error.message,
        error,
      });
    }
  }
  )


  router.put("/", async (req, res) => {
    try {
        const { userID, recipeID } = req.body;

        // Insert into the user_saved_recipes table if the relationship doesn't already exist
        const queryText = `
            INSERT INTO savedRecipes(user_id, recipe_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING; -- avoids duplicate entries
        `;
        
        await pool.query(queryText, [userID, recipeID]);

        // Retrieve all saved recipes for the user to return in the response
        const savedRecipesQuery = `
            SELECT r.*
            FROM recipes r
            JOIN savedRecipes usr ON r.id = usr.recipe_id
            WHERE usr.user_id = $1;
        `;
        
        const savedRecipesResult = await pool.query(savedRecipesQuery, [userID]);

        res.json({ savedRecipes: savedRecipesResult.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while saving the recipe." });
    }
});  


 

// Update a recipe by ID
// router.put('/:recipeID', async (req, res) => {
//     let { name, ingredients, description, instructions, imageUrl, cuisine, cookingTime, difficultyLevel, recipeOwner } = req.body;
//     let {recipeID} = req.params;
//     // Ensure ingredients and instructions are arrays
//     if (typeof ingredients === 'string') {
//         ingredients = ingredients.split(',').map(item => item.trim());
//     }

//     if (typeof instructions === 'string') {
//         instructions = instructions.split(',').map(item => item.trim());
//     }
//     console.log(req.body)
//     try {
//         const updatedRecipe = await pool.query(
//             `UPDATE recipes 
//             SET name = $1, ingredients = $2, description = $3, instructions = $4, imageUrl = $5, cuisine =$6 ,cookingTime = $7, difficultyLevel = $8,recipeOwner = $9 
//             WHERE id = $8 
//             RETURNING *`,
//             [name, ingredients, description, instructions, imageUrl, cuisine, cookingTime, difficultyLevel, recipeOwner, req.params.recipeID]
//         );
//         res.json(updatedRecipe.rows[0]);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });


router.put('/:recipeID', async (req, res) => {
    let { name, ingredients, description, instructions, imageUrl, cuisine, cookingTime, difficultyLevel, recipeOwner } = req.body;
    let { recipeID } = req.params;

    console.log("Recipe ID:", recipeID); 

    // Ensure ingredients and instructions are arrays
    if (typeof ingredients === 'string') {
        ingredients = ingredients.split(',').map(item => item.trim());
    }
    if (typeof instructions === 'string') {
        instructions = instructions.split(',').map(item => item.trim());
    }

    try {
        const updatedRecipe = await pool.query(
            `UPDATE recipes 
            SET name = $1, ingredients = $2, description = $3, instructions = $4, imageUrl = $5, cuisine = $6, cookingTime = $7, difficultyLevel = $8, recipeOwner = $9
            WHERE id = $10 
            RETURNING *`,
            [name, ingredients, description, instructions, imageUrl, cuisine, cookingTime, difficultyLevel, recipeOwner, recipeID]
        );
        console.log(updatedRecipe.rows[0])
        res.json(updatedRecipe.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});


// Delete a recipe by ID
router.delete('/:recipeID', async (req, res) => {
    try {
        await pool.query('DELETE FROM recipes WHERE id = $1', [req.params.recipeID]);
        res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

export { router as recipesRouter };
