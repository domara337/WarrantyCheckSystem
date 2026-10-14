import db from '../config/db.js';


//get all products with brand name 
export const getProductsWithBrandName=async()=>{
    const result =await db.query(
        `SELECT p.* ,b.name as brand_name 
        FROM products p
        JOIN brands b ON p.brand_id=b.id
        ORDER BY p.model_name ASC`
    );
    return result.rows;
}

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
    product_id:any,
    part_number:string,
    brand_id:number,
    model_name:string,
    category:string
) => {
    const result = await db.query(
        `UPDATE products 
         SET part_number = $1, 
             brand_id= $2, 
             model_name = $3, 
             category= $4, 
              
         WHERE id = $5 
         RETURNING *`,
        [
           part_number,
            brand_id,
            model_name,
            category,
            product_id
        ]
    );
    return result.rows[0];
};
