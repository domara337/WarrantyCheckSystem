import db from '../config/db.js';

//find user by email
export const findUserByEmail = async (email: string) => {
    const result = await db.query(
      'SELECT * FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))',
      [email]
    );
    return result.rows[0];
};

//create new user
export const createUser=async(fullname:string,email:string,hashedPassword:string,role:string,branchId:number | null)=>{
    const result=await db.query('INSERT INTO users(full_name,email,password_hash,role,branch_id) VALUES($1,$2,$3,$4,$5) RETURNING *',[fullname,email,hashedPassword,role,branchId]);
  return result.rows[0];
}

//get all users without exposing password hashes
export const getAllUsers=async()=>{
    const result=await db.query(
      `SELECT u.id, u.full_name, u.email, u.role, u.branch_id, b.name AS branch_name
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       ORDER BY u.full_name ASC`
    );
    return result.rows;
}

// Get single user by ID
export const getUserById = async (id: string) => {
  const result = await db.query(
    `SELECT u.id, u.full_name, u.email, u.role, u.branch_id, b.name AS branch_name
     FROM users u
     LEFT JOIN branches b ON u.branch_id = b.id
     WHERE u.id = $1`,
    [id]
  );
  return result.rows[0];
};

export const getUserRoleById = async (id: string): Promise<string | undefined> => {
  const result = await db.query("SELECT role FROM users WHERE id = $1", [id]);
  return result.rows[0]?.role;
};

export const updateUser = async (
  id: string,
  fullName: string,
  email: string,
  role: string,
  branchId: number | null,
) => {
  const result = await db.query(
    `UPDATE users
     SET full_name = $1, email = $2, role = $3, branch_id = $4
     WHERE id = $5
     RETURNING id, full_name, email, role, branch_id`,
    [fullName, email, role, branchId, id]
  );
  const user = result.rows[0];
  if (!user) return undefined;
  const branchResult = await db.query("SELECT name FROM branches WHERE id = $1", [user.branch_id]);
  return { ...user, branch_name: branchResult.rows[0]?.name ?? null };
};

// Delete user by ID
export const deleteUser = async (id: string) => {
  const result = await db.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
  return result.rows[0];
};