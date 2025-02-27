import { Router } from "express";

import userRoutes from "./user.route";

const rootRoutes: Router = Router();

rootRoutes.use("/user", userRoutes)



export default rootRoutes