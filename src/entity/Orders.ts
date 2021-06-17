import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import {OrderItems} from "./OrderItems";
import {OrderPayments} from "./OrderPayments";

@Entity({ name: "orders" })
export class Orders {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 45, nullable: false, unique: true })
    order_no: string;

    @Column({ type: "int", width: 11, nullable: false })
    amount: string;

    @Column({ type: "text", nullable: false })
    desc: string;

    @Column({ type: "int", width: 11, nullable: false })
    status: string;

    @Column({ type: "datetime", nullable: false })
    date_created: string;

    @OneToMany((type) => OrderItems, (orderItem) => orderItem.order)
    order_items: OrderItems[];

    @OneToMany((type) => OrderPayments, (orderPayment) => orderPayment.order)
    order_payments: OrderPayments[];
}