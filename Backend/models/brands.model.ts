import db from '../config/db.js';

//get all brands
export const getAllBrands=async()=>{
    const result=await db.query('SELECT * FROM brands ORDER BY name ASC');
    return result.rows;
}

//get brand by id
export const getBrandByid=async(id:number)=>{
    const result=await db.query('SELECT * FROM brands WHERE id=$1',[id]);
    return result.rows[0];
}

//Insert a new brand
export const createBrand=async(name:string)=>{
    const result=await db.query('INSERT INTO brands(name) VALUES($1) RETURNING *' ,[name]);
    return result.rows[0];
}

//Delete a brand by id
export const deleteBrand=async(id:number)=>{
    const result=await db.query('DELETE FROM brands WHERE id=$1 RETURNING *',[id]);
    return result.rows[0];
}

//update a brand by id
export const updateBrand=async(id:number,name:string)=>{
    const result=await db.query('UPDATE brands SET name=$1 WHERE id=$2 RETURNING *',[name,id]);
    return result.rows[0];
}
