import db from '../config/db.js';

export const getProducts=async()=>{
    const result=await db.query(
        `SELECT * FROM products ORDER BY model_name ASC`
    )
    return result.rows;
}

// get all products with optional brand filter
export const getProductsWithBrandName = async (brand?: string) => {
  let query = `
    SELECT p.*, b.name as brand_name 
    FROM products p
    JOIN brands b ON p.brand_id = b.id
  `;
  const values: any[] = [];

  if (brand) {
    // ILIKE performs a case-insensitive search matching brand or model
    query += ` WHERE b.name ILIKE $1 OR p.model_name ILIKE $1`;
    values.push(`%${brand}%`);
  }

  query += ` ORDER BY p.model_name ASC`;

  const result = await db.query(query, values);
  return result.rows;
};

// ==========================================
// 4. Brand-filtered Queries (CHANGE: added for cascading Brand → Product dropdown)
// ==========================================

// Fetch products filtered by a specific brand_id (used by the unified "Enter Product" form)
export const getProductsByBrandId = async (brandId: number) => {
  const result = await db.query(
    `SELECT p.*, b.name as brand_name
     FROM products p
     JOIN brands b ON p.brand_id = b.id
     WHERE p.brand_id = $1
     ORDER BY p.model_name ASC`,
    [brandId]
  );
  return result.rows;
};

//Find product by exact part number
export const getProductByPartNumber=async(part_number:string)=>{
    const result=await db.query('SELECT * FROM products WHERE part_number=$1',[part_number]);
    return result.rows[0];
}

//get product by id
export const getProductById=async(id:number)=>{
    const result=await db.query('SELECT * FROM products WHERE id=$1',[id]);
    return result.rows[0];
}

//Insert a new product
export const createProduct=async(part_number:string,brand_id:number,model_name:string,category:string)=>{
    const result=await db.query(
        'INSERT INTO products(part_number,brand_id,model_name,category) VALUES($1,$2,$3,$4) RETURNING *' ,[part_number,brand_id,model_name,category]);
   return result.rows[0];
    };
 
//Delete a product by id
export const deleteProduct=async(id:number)=>{
    const result=await db.query('DELETE FROM products WHERE id=$1 RETURNING *',[id]);
    return result.rows[0];
}

//Update a product by id
export const UpdateProduct = async (
    product_id: any,
    data: {
        part_number?: string;
        brand_id?: number;
        model_name?: string;
        category?: string;
    }
) => {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Dynamically add fields if they are provided in the payload
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
            fields.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
        }
    });

    // If no fields are provided to update, return early
    if (fields.length === 0) {
        throw new Error("No fields provided for update.");
    }

    // Append product_id as the final parameter for the WHERE clause
    values.push(product_id);

    const query = `
        UPDATE products 
        SET ${fields.join(", ")}
        WHERE id = $${paramIndex} 
        RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
};