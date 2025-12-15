const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Artifact = require('./models/Artifact');
const Collection = require('./models/Collection');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await Artifact.deleteMany();
        await Collection.deleteMany();
        await User.deleteMany();

        const createdUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123', // In a real app, hash this!
            isAdmin: true,
        });

        const adminUser = createdUser._id;

        const artifacts = [
            {
                title: 'Ancient Roman Pottery',
                description: 'A fine example of Roman craftsmanship.',
                imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbnkMndZpTtLeuZbm_17WpPZri0JEgSoi1zs7rP6GiF-OYyWgdmkDW2SAUM3RoufnbyJfMrBOv9fPSM4T-Aoo8MN8VRGv9cpscvUyVP0yNTytkfgHDxK1--Z6Zesm3L_jmY5JO3Ur9nkG9HJahV8J4dgGplqf61QbbEod7ZOMVcg-XIVz5t7PGe2M6B-LH5vNwATFyxQxXD4_Kn1mkI-pahBaa82xgb3-mCbSqt47uDzcalxM4OklYlXlJOAITAPopa0FrJp7-cFGP',
                category: 'Pottery',
                era: 'Roman Empire',
                region: 'Rome',
                user: adminUser,
                status: 'approved',
            },
            {
                title: 'Japanese Ukiyo-e Prints',
                description: 'Traditional Japanese woodblock prints.',
                imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcojyFJAiCm17JFyVnpquXglPg-wZzp3B8ptI7wCONeWDHJFwWIHH6GOConnBLMfpXyhiB1GaXHIEqdSt-O_B2mwebVdWTlRvGembKh8RPbcxSxFeR41K51U0bOLKabdtcTeMCPkA0wQUUWg8Zn2FjXBw3M6uMoB5tQ-IDDSbtZDww0OerzZSZXXv2PTGNx5jV4WS2-Pxaz7bTfZaahaGjkkNbIrm8hK86oSv0jLKR-fMG0VltDt3Uo8YVn88BI2vDj2sbhNvTJQfp',
                category: 'Art',
                era: 'Edo Period',
                region: 'Japan',
                user: adminUser,
                status: 'approved',
            },
            {
                title: 'Mayan Glyphs & Carvings',
                description: 'Intricate carvings from the Mayan civilization.',
                imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAANO5rXVxCzl6AbJGuGLznxp8PM05BGjwnKB7hMDh0IwSjp2XRq6S-GdOOK_prCLuwW4Lx51yG9yX7mTgV3mktU5efNchUtCpD2PIu8xmfnrKCiNSwNwMPBoJfFHY9lGhWQDu7xcIYH2YgN7YLSl-_aXHH1IDhGEY0Nhskl8UUC7kioU1PDkisE7hlvpUk5I8bsVpo3skOj3iOaPfVVDbF9D_rtGtaVqxYGmqUpKN1B-o9z2-TKzuPQyOSg7CCuLoTwsg689dBAzBr',
                category: 'Sculpture',
                era: 'Classic Period',
                region: 'Mexico',
                user: adminUser,
                status: 'approved',
            },
            {
                title: 'Egyptian Hieroglyphs',
                description: 'Ancient Egyptian writing system samples.',
                imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhTPw0YWnOQg030iU-W6fobY36qv5AOPUdosems3tFK1zCx_MCLtQFx5qIujvlJlwhmMWyOg_cLu5tEb2pZr2-iAtwK--ccXOIVML401DqJKNGFQnfyx8sRrb6jz-aR42Pl-na9jnwKGWVH2--Jd0G1ULDDdb6oQXJbwp1kS0bHQ2RSRnLglZSRgf1avffR4nDa5B1ukzX6ZMs5H2ifbCBWiX9hscZCv1LUHhg9LioTGg1UhvYaAAztxUU2S84O925qNZdb_bBCFsl',
                category: 'Writing',
                era: 'Ancient Egypt',
                region: 'Egypt',
                user: adminUser,
                status: 'approved',
            },
            {
                title: 'Viking Runic Stones',
                description: 'Stones with runic inscriptions.',
                imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8F7xc87bNYtR730ksb_eNqJh_El_aH7G1Vuznx5V72zoKXiNpixuqYd_SU7rJd2FkmdlTXzbnvFL14X6_klKA47b0YNX5nHatyc61ZijO2i5fmdQ2gkQpsaapaIu7ODQjqQ4emsxuli-EkS1XZD0B8pQwAiwc66Wt2bxBfBqfv-Xbe2deaUNTbv9ZZcaOLxKpd0-OSIOvpgJiIz2IdMCG7zF_yWEuK7wK9znnbbPrkIw1jH1fV6a6B-NKmuV-jDSGZrlcJfLIYzpn',
                category: 'Monument',
                era: 'Viking Age',
                region: 'Scandinavia',
                user: adminUser,
                status: 'approved',
            },
            {
                title: 'Persian Miniature Paintings',
                description: 'Small, detailed paintings from Persia.',
                imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDieylGph9JF11jwi5zV5_4A-PMgPl_xDopp8EkptlUX_W96qlXRNJVMILwn-g4G6DksQH6skbWrQHfCm9oPS_-7LNmcgouNnjJi3G48g2DU-0q7cpoLY3c_X14HwX-8OBRtaP-37nefWyvbXRULdi0D7BZAIpS6qmL4y8sfTxRiRSUDsHafh5STQaPpJiSZLXyOrnmw7o3TpP0nU3-zOI1wC2WUsghlfKFt5IwrHdEbkA77I_mmtZVfai0LjdFMcDdU_fmGBBR8fI4',
                category: 'Art',
                era: 'Timurid Empire',
                region: 'Persia',
                user: adminUser,
                status: 'approved',
            },

        ];

        await Artifact.insertMany(artifacts);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
