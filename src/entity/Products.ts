import {Entity, PrimaryGeneratedColumn, Column, Index, OneToMany, PrimaryColumn} from "typeorm";
import {OrderItems} from "./OrderItems";

@Entity({ name: "products" })
export class Products {
    @Index({ unique: true })
    @PrimaryColumn({type: "int", width: 11})
    id: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    name: string;

    @Column({ type: "int", width: 11, nullable: false })
    price: string;

    @Column({ type: "text", nullable: false })
    desc: string;

    @OneToMany((type) => OrderItems, (orderItem) => orderItem.product)
    order_items: OrderItems[];
}