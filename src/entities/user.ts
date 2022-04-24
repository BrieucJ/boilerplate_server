import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, BaseEntity, BeforeInsert, BeforeUpdate } from 'typeorm'
import { hashPassword } from '../utils/authentication'
import { Length, IsEmail, MinLength, IsNotEmpty, validateOrReject } from 'class-validator'
import { UserInputError, ValidationError } from 'apollo-server-express'
import { IsEmailUnique } from '../utils/validators'

@Entity()
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Length(3, 50, { message: 'username_must_be_between_3_and_50_characters' })
  @IsNotEmpty({ message: 'username_cannot_be_empty' })
  @Column()
  username!: string

  @IsEmailUnique({ message: 'email_must_be_unique' })
  @IsEmail({}, { message: 'email_must_be_an_email' })
  @IsNotEmpty({ message: 'email_cannot_be_empty' })
  @Column({ unique: true })
  email!: string

  @MinLength(8, { message: 'password_must_be_at_least_8_characters' })
  @IsNotEmpty({ message: 'password_cannot_be_empty' })
  @Column()
  password!: string

  @Column({ default: false })
  confirmed!: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  //HOOKS
  @BeforeInsert()
  @BeforeUpdate()
  async hook() {
    await validateOrReject(this).catch((errors: ValidationError[]) => {
      throw new UserInputError('VALIDATION_ERROR', { errors: errors })
    })
    this.password = hashPassword(this.password)
  }
}
