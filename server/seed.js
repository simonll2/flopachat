const mongoose = require("./lib/mongo");
const bcrypt = require("bcrypt");

const User = require("./models/userModel");
const Product = require("./models/productModel");
const Order = require("./models/orderModel");

const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const seedDatabase = async () => {
  try {
    // Vérifier si la base de données est vide
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();

    if (userCount === 0 && productCount === 0) {
      console.log("Database is empty, seeding data...");

      // Create admin user
      const admin = new User({
        email: "admin@admin.com",
        password: await bcrypt.hash("admin", 10),
        role: "admin",
        firstName: "Admin",
        lastName: "Admin",
        address: {
          street: "Admin rue de l'admin",
          city: "Admin City",
          state: "Admin State",
          postalCode: "00000",
          country: "Adminland",
        },
        imagePath: "/static/users/terry.jpg",
      });

      // Create regular users
      const users = [
        new User({
          email: "jean@soma.com",
          password: await bcrypt.hash("jean", 10),
          role: "user",
          firstName: "Jean",
          lastName: "Soma",
          address: {
            street: "30 avenue de la République",
            city: "Villejuif",
            state: "Ile-de-France",
            postalCode: "94800",
            country: "France",
          },
          imagePath: "/static/users/soma.jpg",
        }),
        new User({
          email: "jean@sommeil.com",
          password: await bcrypt.hash("jean", 10),
          role: "user",
          firstName: "Jean",
          lastName: "Sommeil",
          address: {
            street: "30 avenue de la République",
            city: "Villejuif",
            state: "Ile-de-France",
            postalCode: "94800",
            country: "France",
          },
          imagePath: "/static/users/jean.jpg",
        }),
        new User({
          email: "jean@coma.com",
          password: await bcrypt.hash("jean", 10),
          role: "user",
          firstName: "Jean",
          lastName: "Coma",
          address: {
            street: "30 avenue de la République",
            city: "Villejuif",
            state: "Ile-de-France",
            postalCode: "94800",
            country: "France",
          },
          imagePath: "/static/users/coma.jpg",
        }),
        new User({
          email: "titouna@trafic.com",
          password: await bcrypt.hash("titouna", 10),
          role: "user",
          firstName: "Titouna",
          lastName: "Trafic",
          address: {
            street: "30 Avenue de la République",
            city: "Villejuif",
            state: "Ile-de-France",
            postalCode: "94800",
            country: "France",
          },
          imagePath: "/static/users/trafic.jpg",
        }),
        new User({
          email: "frederic@menottes.com",
          password: await bcrypt.hash("frederic", 10),
          role: "user",
          firstName: "Fréderic",
          lastName: "Menottes",
          address: {
            street: "30 Avenue de la République",
            city: "Villejuif",
            state: "Ile-de-France",
            postalCode: "94800",
            country: "France",
          },
          imagePath: "/static/users/menottes.jpg",
        }),
        new User({
          email: "hoshra@possain.com",
          password: await bcrypt.hash("hoshra", 10),
          role: "user",
          firstName: "Hoshra",
          lastName: "Possain",
          address: {
            street: "30 avenue de la République",
            city: "Villejuif",
            state: "Ile-de-France",
            postalCode: "94800",
            country: "France",
          },
          imagePath: "/static/users/curcuma.jpg",
        }),
        new User({
          email: "frederic@menu.com",
          password: await bcrypt.hash("frederic", 10),
          role: "user",
          firstName: "Fréderic",
          lastName: "Menu",
          address: {
            street: "30 Avenue de la République",
            city: "Villejuif",
            state: "Ile-de-France",
            postalCode: "94800",
            country: "France",
          },
          imagePath: "/static/users/frederic.jpg",
        }),
        new User({
          email: "roxane@chevallier.com",
          password: await bcrypt.hash("roxane", 10),
          role: "user",
          firstName: "Roxane",
          lastName: "Chevallier",
          address: {
            street: "30 Avenue de la République",
            city: "Villejuif",
            state: "Ile-de-France",
            postalCode: "94800",
            country: "France",
          },
          imagePath: "/static/users/roxane.jpg",
        }),
        new User({
          email: "simon@lucas.com",
          password: await bcrypt.hash("simon", 10),
          role: "user",
          firstName: "Simon",
          lastName: "Lucas",
          address: {
            street: "30 Avenue de la République",
            city: "Villejuif",
            state: "Ile-de-France",
            postalCode: "94800",
            country: "France",
          },
          imagePath: "/static/users/simon.jpg",
        }),
        new User({
          email: "50@centimes.com",
          password: await bcrypt.hash("50", 10),
          role: "user",
          firstName: "50",
          lastName: "centimes",
          address: {
            street: "30 Avenue de la République",
            city: "Villejuif",
            state: "Ile-de-France",
            postalCode: "94800",
            country: "France",
          },
          imagePath: "/static/users/plaque.jpg",
        }),
        new User({
          email: "juba@Tajine.com",
          password: await bcrypt.hash("juba", 10),
          role: "user",
          firstName: "Juba",
          lastName: "Tajine",
          address: {
            street: "30 Avenue de la République",
            city: "Villejuif",
            state: "Ile-de-France",
            postalCode: "94800",
            country: "France",
          },
          imagePath: "/static/users/juba.jpg",
        }),
      ];

      // Create products
      const products = [
        new Product({
          name: "Iphone 15 pas Pro",
          description: "dernier modèle de la célèbre marque",
          price: 1900,
          stock: 50,
          imagePath: "/static/products/iphone.jpg",
          thumbsUp: 10,
          thumbsDown: 300,
        }),
        new Product({
          name: "Macbook Pro déconditionné",
          description: "ordinateur portable haute performance en état pitoyable",
          price: 1300,
          stock: 30,
          imagePath: "/static/products/macbook.jpg",
          thumbsUp: 5,
          thumbsDown: 200,
        }),
        new Product({
          name: "Télévision 4K",
          description: "grosse Télé à 4000 euros",
          price: 4000,
          stock: 20,
          imagePath: "/static/products/tele.jpg",
          thumbsUp: 7,
          thumbsDown: 150,
        }),
        new Product({
          name: "Gros Casque Sans Fil",
          description: "gros casque qui marche pas car y a pas de fil",
          price: 200,
          stock: 100,
          imagePath: "/static/products/casque.jpg",
          thumbsUp: 3,
          thumbsDown: 250,
        }),
        new Product({
          name: "Fil du casque sans fil",
          description: "fil du casque sans fil, un peu de soudure et ça passe",
          price: 500,
          stock: 25,
          imagePath: "/static/products/fil.jpg",
          thumbsUp: 1,
          thumbsDown: 100,
        }),
        new Product({
          name: "Tour de Bureau",
          description: "tour de bureau perf",
          price: 900,
          stock: 40,
          imagePath: "/static/products/tour.jpg",
          thumbsUp: 8,
          thumbsDown: 120,
        }),
        new Product({
          name: "Bracelet électronique",
          description: "bracelet électronique récupéré à fleury-mérogis",
          price: 250,
          stock: 1,
          imagePath: "/static/products/bracelet.jpg",
          thumbsUp: 2,
          thumbsDown: 300,
        }),
        new Product({
          name: "Calculatrice Efrei",
          description: "très bonne calculatrice pour passer les DE notamment celui de SI",
          price: 50,
          stock: 60,
          imagePath: "/static/products/calculatrice.jpg",
          thumbsUp: 15,
          thumbsDown: 80,
        }),
        new Product({
          name: "Clavier Mécanique",
          description: "clavier mécanique avec rétroéclairage et touches programmables",
          price: 150,
          stock: 120,
          imagePath: "/static/products/default-product.jpg",
          thumbsUp: 12,
          thumbsDown: 110,
        }),
        new Product({
          name: "Écran nombre pouces",
          description: "écran qui a reçu nombre pouces de la part de nos clients",
          price: 500,
          stock: 70,
          imagePath: "/static/products/ecran.jpg",
          thumbsUp: 27,
          thumbsDown: 90,
        }),
        new Product({
          name: "Écouteurs Sans Fil",
          description: "écouteurs sans fil avec étui de chargement",
          price: 60,
          stock: 150,
          imagePath: "/static/products/default-product.jpg",
          thumbsUp: 6,
          thumbsDown: 130,
        }),
        new Product({
          name: "Imprimante Multifonction",
          description: "beaucoup d'imprimantes pour assurer une fonction multiple ? (pas sûr)",
          price: 160,
          stock: 60,
          imagePath: "/static/products/imprimante.jpg",
          thumbsUp: 4,
          thumbsDown: 140,
        }),
      ];

      // Save the admin, users, and products to the database
      await User.insertMany([admin]);
      await User.insertMany(users);
      await Product.insertMany(products);

      // Generate and save orders
      const orders = [];

      for (const user of users) {
        const numOrders = Math.floor(Math.random() * 10) + 5; // Generate between 5 and 15 orders per user
        for (let i = 0; i < numOrders; i++) {
          const productSamples = products.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 1);
          const orderItems = productSamples.map((product) => ({
            product: product._id,
            quantity: Math.floor(Math.random() * 5) + 1,
          }));
          const total = orderItems.reduce(
            (sum, item) => sum + item.quantity * products.find((p) => p._id.equals(item.product)).price,
            0
          );
          const randomDate = getRandomDate(new Date(new Date().setFullYear(new Date().getFullYear() - 1)), new Date());
          // Répartition réaliste des statuts : 60% delivered, 30% completed, 10% pending
          const rand = Math.random();
          const status = rand < 0.6 ? "delivered" : rand < 0.9 ? "completed" : "pending";
          const order = new Order({
            user: user._id,
            products: orderItems,
            total,
            status,
            createdAt: randomDate,
          });
          orders.push(order);
        }
      }

      await Order.insertMany(orders);

      console.log("Database seeded successfully");
    } else {
      console.log("Database already has data, skipping seeding");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

module.exports = seedDatabase;
