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
export const createBrand=async(name:string,code:string)=>{
    const result=await db.query('INSERT INTO brands(name,code) VALUES($1,$2) RETURNING *' ,[name,code]);
    return result.rows[0];
}

//Delete a brand by id
export const deleteBrand=async(id:number)=>{
    const result=await db.query('DELETE FROM brands WHERE id=$1 RETURNING *',[id]);
    return result.rows[0];
}

//update a brand by id
export const updateBrand=async(id:number,name:string,code:string)=>{
    const result=await db.query('UPDATE brands SET name=$1,code=$2 WHERE id=$3 RETURNING *',[name,code,id]);
    return result.rows[0];
}
