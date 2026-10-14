import db from '../config/db.js';


export interface Branch{
    id:number;
    name:string;
    code:string;
 created_at?: Date;
  updated_at?: Date;
}
//get all branches
export const getAllBranches=async()=>{
    const result=await db.query('SELECT * FROM branches ORDER BY id ASC');
    return result.rows;
}

//get branch by id
export const getBranchById=async(id:number)=>{
    const result=await db.query('SELECT * FROM branches WHERE id=$1',[id]);
    return result.rows[0];

}

//Insertting a new branch
export const createBranch=async(name:string,code:string)=>{
    const result=await db.query('INSERT INTO branches(name,code) VALUES($1,$2) RETURNING *' ,[name,code]);
    return result.rows[0];
}

//Delete a branch by id
export const deleteBranch=async(id:number)=>{
    const result=await db.query('DELETE FROM branches WHERE id=$1 RETURNING *',[id]);
    return result.rows[0];
}




//updates a branch by its id
export const updateBranch = async (
  id: number,
  name: string,
  code: string
): Promise<Branch | null> => {
  try {
    const query = `
      UPDATE branches 
      SET name = $1, code = $2 
      WHERE id = $3 
      RETURNING *;
    `;
    const values = [name, code, id];
    const result = await db.query(query, values);

    // Return null if no row was updated (e.g., non-existent ID)
    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error(`Error updating branch with ID ${id}:`, error);
    throw error;
  }
};