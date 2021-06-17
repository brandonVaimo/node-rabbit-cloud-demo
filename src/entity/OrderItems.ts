import {Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {Products} from "./Products";
import {Orders} from "./Orders";

@Entity({ name: "order_items" })
export class OrderItems {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => Orders, order => order.id)
    @JoinColumn({ name: 'order_id'})
    order: OrderItems;

    @ManyToOne(type => Products, product => product.id)
    @JoinColumn({ name: 'product_id'})
    product: Products[];
}