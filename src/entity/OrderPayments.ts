import {Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import { Orders } from "./Orders";

@Entity({ name: "order_payments" })
export class OrderPayments {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "int", width: 11, nullable: false })
    status: string;

    @Column({ type: "varchar", length: 25, nullable: false })
    status_desc: string;

    @Column({ type: "int", width: 11,  nullable: false })
    amount: string;

    @ManyToOne(type => Orders, order => order.id)
    @JoinColumn({ name: 'order_id'})
    order: Orders;
}