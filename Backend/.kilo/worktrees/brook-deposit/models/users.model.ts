import db from '../config/db.js';

//find user by email
export const findUserByEmail = async (email: string) => {
    const result=await db.query('SELECT * FROM users WHERE email=$1', [email]);
    return result.rows[0];
};

//create new user
export const createUser=async(fullname:string,email:string,hashedPassword:string,role:string,branchId:number)=>{
    const result=await db.query('INSERT INTO users(full_name,email,password_hash,role,branch_id) VALUES($1,$2,$3,$4,$5) RETURNING *',[fullname,email,hashedPassword,role,branchId]);
  return result.rows[0];
}

//get all users
export const getAllUsers=async()=>{
    const result=await db.query('SELECT * FROM users');
    return result.rows;
}

//get all staff users
export const getAllStaffUsers=async()=>{
    const result=await db.query('SELECT u.id, u.full_name,u.email,u.role,u.branch_id,b.name as branch_name FROM usres u LEFT JOIN branches b ON u.branch_id=b.id');
        return result.rows;
    }


// Get single user by ID
export const getUserById = async (id: any) => {
  const result = await db.query("SELECT id, full_name, email, role, branch_id FROM users WHERE id = $1", [id]);
  return result.rows[0];
};

// Delete user by ID
export const deleteUser = async (id:any) => {
  const result = await db.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
  return result.rows[0];
};