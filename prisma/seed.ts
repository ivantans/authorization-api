import { PrismaClient } from "@prisma/client";
import * as bcryptjs from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
	const roles = await prisma.role.createMany({
		data: [
			{ name: 'CEO', description: 'Chief Executive Officer' },
			{ name: 'MARKETING', description: 'Marketing Department' },
			{ name: 'SALES', description: 'Sales Department' },
			{ name: 'SUBSCRIPTION', description: 'Subscription Customer' },
			{ name: 'PREMIUM_CUSTOMER', description: 'Premium Customer' },
			{ name: 'TRIAL_MEMBER', description: 'Customer with trial access' },
			{ name: 'BASIC', description: 'None Role' },
		],
		skipDuplicates: true
	})

	const employee1 = await prisma.employee.upsert({
		where: { email: "employee1@employee.com" },
		update: {},
		create: {
			email: "employee1@employee.com",
			password: await bcryptjs.hash("employee123#", 12),
			employeeRoles: {
				create: [
					{ role: { connect: { name: "CEO" } } },
				],
			}
		}
	});

	const employee2 = await prisma.employee.upsert({
		where: { email: "employee2@employee.com" },
		update: {},
		create: {
			email: "employee2@employee.com",
			password: await bcryptjs.hash("employee123#", 12),
			employeeRoles: {
				create: [
					{ role: { connect: { name: "SALES" } } },
					{ role: { connect: { name: "MARKETING" } } }
				]
			}
		}
	});

	const customer1 = await prisma.customer.upsert({
		where: { email: "customer1@gmail.com" },
		update: {},
		create: {
			email: "customer1@gmail.com",
			password: await bcryptjs.hash("customer123#", 12),
			customerRoles: {
				create: [
					{ role: { connect: { name: "SUBSCRIPTION" } } },
					{ role: { connect: { name: "PREMIUM_CUSTOMER" } } },
				]
			}
		}
	});

	const customer2 = await prisma.customer.upsert({
		where: { email: "customer2@gmail.com" },
		update: {},
		create: {
			email: "customer2@gmail.com",
			password: await bcryptjs.hash("customer123#", 12),
			customerRoles: {
				create: [
					{ role: { connect: { name: "TRIAL_MEMBER" } } }
				]
			}
		}
	});
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})