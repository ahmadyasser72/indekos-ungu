export const hashPassword = (password: string) => Bun.password.hash(password);

export const verifyPassword = (password: string, hash: string) =>
	Bun.password.verify(password, hash);
