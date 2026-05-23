import type {db} from "../db";
import {type InsertMealsModel, meals} from "../db/schema.ts";


export class MealsService {
    constructor(private readonly  database: typeof db) {}

    async create(meal: InsertMealsModel){
        const [record] = await this.database.insert(meals).values(meal).returning()


        console.log(`saved meal ${record?.id} for user ${record?.userId}`)

        return record
    }
}