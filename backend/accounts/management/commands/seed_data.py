import random
from decimal import Decimal
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify
from accounts.models import CustomUser
from restaurants.models import Restaurant, RestaurantCategory
from menu.models import MenuCategory, MenuItem
from orders.models import Order, OrderItem
from reviews.models import Review


class Command(BaseCommand):
    help = 'Seed database with realistic demo data for FeastDash'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing seed data before re-seeding')

    def handle(self, *args, **options):
        self.stdout.write('Seeding FeastDash database...\n')

        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing seed data...'))
            test_emails = [
                'ahmed@test.com', 'fatima@test.com', 'usman@test.com', 'ayesha@test.com', 'hassan@test.com',
                'bilal@test.com', 'sana@test.com', 'imran@test.com', 'nadia@test.com', 'tariq@test.com',
                'kamran@test.com', 'waqas@test.com', 'zubair@test.com', 'adeel@test.com', 'faisal@test.com',
                'admin@feastdash.pk',
            ]
            CustomUser.objects.filter(email__in=test_emails).delete()

        # Check if seed data already exists
        if CustomUser.objects.filter(email='ahmed@test.com').exists():
            self.stdout.write(self.style.WARNING('Seed data already exists. Use --clear to re-seed.\n'))
            return

        # ── Users ──────────────────────────────────────────────
        customers = []
        CUSTOMER_DATA = [
            ('Ahmed', 'Khan', 'ahmed@test.com', '03001234567', 'Karachi'),
            ('Fatima', 'Ali', 'fatima@test.com', '03012345678', 'Lahore'),
            ('Usman', 'Malik', 'usman@test.com', '03023456789', 'Islamabad'),
            ('Ayesha', 'Siddiqui', 'ayesha@test.com', '03034567890', 'Rawalpindi'),
            ('Hassan', 'Raza', 'hassan@test.com', '03045678901', 'Karachi'),
        ]
        for first, last, email, phone, city in CUSTOMER_DATA:
            u = CustomUser.objects.create_user(
                username=email.split('@')[0],
                email=email, password='test1234',
                first_name=first, last_name=last,
                phone=phone, city=city, user_type='customer',
            )
            customers.append(u)

        owners = []
        OWNER_DATA = [
            ('Bilal', 'Ahmad', 'bilal@test.com', '03101234567', 'Karachi'),
            ('Sana', 'Sheikh', 'sana@test.com', '03112345678', 'Lahore'),
            ('Imran', 'Qureshi', 'imran@test.com', '03123456789', 'Islamabad'),
            ('Nadia', 'Butt', 'nadia@test.com', '03134567890', 'Rawalpindi'),
            ('Tariq', 'Mehmood', 'tariq@test.com', '03145678901', 'Karachi'),
        ]
        for first, last, email, phone, city in OWNER_DATA:
            u = CustomUser.objects.create_user(
                username=email.split('@')[0],
                email=email, password='test1234',
                first_name=first, last_name=last,
                phone=phone, city=city, user_type='restaurant_owner',
            )
            owners.append(u)

        drivers = []
        DRIVER_DATA = [
            ('Kamran', 'Hussain', 'kamran@test.com', '03201234567', 'Karachi'),
            ('Waqas', 'Ali', 'waqas@test.com', '03212345678', 'Lahore'),
            ('Zubair', 'Khan', 'zubair@test.com', '03223456789', 'Islamabad'),
            ('Adeel', 'Iqbal', 'adeel@test.com', '03234567890', 'Rawalpindi'),
            ('Faisal', 'Shah', 'faisal@test.com', '03245678901', 'Karachi'),
        ]
        for first, last, email, phone, city in DRIVER_DATA:
            u = CustomUser.objects.create_user(
                username=email.split('@')[0],
                email=email, password='test1234',
                first_name=first, last_name=last,
                phone=phone, city=city, user_type='delivery_driver',
            )
            drivers.append(u)

        # Admin user — handle existing admin username gracefully
        admin = CustomUser.objects.filter(username='admin').first()
        if admin:
            admin.email = 'admin@feastdash.pk'
            admin.user_type = 'admin'
            admin.first_name = 'Admin'
            admin.last_name = 'User'
            admin.set_password('test1234')
            admin.save()
        else:
            admin = CustomUser.objects.create_user(
                username='admin', email='admin@feastdash.pk', password='test1234',
                first_name='Admin', last_name='User',
                phone='03001111111', city='Lahore', user_type='admin',
            )

        self.stdout.write(f'  Created {len(customers) + len(owners) + len(drivers) + 1} users')

        # ── Restaurant Categories ──────────────────────────────
        CATEGORIES = ['Pakistani', 'Fast Food', 'Chinese', 'BBQ & Grill', 'Pizza', 'Desserts & Sweets']
        cat_map = {}
        for name in CATEGORIES:
            cat, _ = RestaurantCategory.objects.get_or_create(
                name=name, defaults={'slug': slugify(name), 'is_active': True}
            )
            cat_map[name] = cat

        # ── Restaurants ────────────────────────────────────────
        RESTAURANTS = [
            {
                'name': 'Karachi Biryani House', 'cuisine_type': 'Pakistani', 'owner': owners[0],
                'city': 'Karachi', 'address': 'Block 5, Clifton', 'phone': '02135123456',
                'delivery_fee': 100, 'minimum_order': 300, 'average_rating': 4.5, 'total_reviews': 28,
                'estimated_delivery_time': 35, 'description': 'Authentic Karachi-style biryani and BBQ since 1995. Our secret masala recipe has been passed down through generations.',
                'email': 'info@karachibiryani.pk',
            },
            {
                'name': 'Lahore Tikka Corner', 'cuisine_type': 'BBQ & Grill', 'owner': owners[1],
                'city': 'Lahore', 'address': 'Main Boulevard, Gulberg III', 'phone': '04235678901',
                'delivery_fee': 80, 'minimum_order': 250, 'average_rating': 4.3, 'total_reviews': 22,
                'estimated_delivery_time': 30, 'description': 'Famous Lahori tikka and BBQ. Charcoal-grilled perfection that melts in your mouth.',
                'email': 'order@lahoretikka.pk',
            },
            {
                'name': 'Pizza Planet', 'cuisine_type': 'Pizza', 'owner': owners[2],
                'city': 'Islamabad', 'address': 'F-7 Markaz, Jinnah Super', 'phone': '05112345678',
                'delivery_fee': 120, 'minimum_order': 400, 'average_rating': 4.1, 'total_reviews': 15,
                'estimated_delivery_time': 40, 'description': 'Hand-tossed pizzas with premium toppings. Serving the capital city with cheesy goodness.',
                'email': 'hello@pizzaplanet.pk',
            },
            {
                'name': 'Dragon Palace', 'cuisine_type': 'Chinese', 'owner': owners[3],
                'city': 'Rawalpindi', 'address': 'Saddar, Bank Road', 'phone': '05123456789',
                'delivery_fee': 100, 'minimum_order': 350, 'average_rating': 4.4, 'total_reviews': 18,
                'estimated_delivery_time': 35, 'description': 'Indo-Chinese fusion at its finest. From Manchurian to Chow Mein, we bring the East to your plate.',
                'email': 'info@dragonpalace.pk',
            },
            {
                'name': 'Burger Lab Express', 'cuisine_type': 'Fast Food', 'owner': owners[4],
                'city': 'Karachi', 'address': 'PECHS Block 6', 'phone': '02134567890',
                'delivery_fee': 60, 'minimum_order': 200, 'average_rating': 4.6, 'total_reviews': 35,
                'estimated_delivery_time': 25, 'description': 'Smashed burgers, loaded fries, and thick shakes. The ultimate comfort food experience.',
                'email': 'eat@burgerlab.pk',
            },
            {
                'name': 'Meetha Ghar', 'cuisine_type': 'Desserts & Sweets', 'owner': owners[0],
                'city': 'Lahore', 'address': 'Liberty Market', 'phone': '04234567890',
                'delivery_fee': 70, 'minimum_order': 150, 'average_rating': 4.2, 'total_reviews': 12,
                'estimated_delivery_time': 20, 'description': 'Traditional Pakistani mithai and modern desserts. Sweetness delivered to your doorstep.',
                'email': 'sweet@meethaghar.pk',
            },
            {
                'name': 'Chaaye Khana', 'cuisine_type': 'Pakistani', 'owner': owners[1],
                'city': 'Islamabad', 'address': 'F-6 Markaz', 'phone': '05134567890',
                'delivery_fee': 90, 'minimum_order': 200, 'average_rating': 4.0, 'total_reviews': 10,
                'estimated_delivery_time': 30, 'description': 'A cozy Pakistani cafe experience. Fresh parathas, desi nashta, and the best doodh patti in town.',
                'email': 'salam@chaayekhana.pk',
            },
            {
                'name': 'Al-Habib Restaurant', 'cuisine_type': 'Pakistani', 'owner': owners[2],
                'city': 'Rawalpindi', 'address': 'Commercial Market, Satellite Town', 'phone': '05145678901',
                'delivery_fee': 80, 'minimum_order': 300, 'average_rating': 4.7, 'total_reviews': 40,
                'estimated_delivery_time': 35, 'description': 'Premium Pakistani cuisine. Our nihari, paye, and haleem are legendary across the twin cities.',
                'email': 'info@alhabib.pk',
            },
        ]

        restaurant_objs = []
        for r in RESTAURANTS:
            slug = slugify(r['name'])
            base_slug = slug
            n = 1
            while Restaurant.objects.filter(slug=slug).exists():
                slug = f'{base_slug}-{n}'
                n += 1
            rest = Restaurant.objects.create(
                owner=r['owner'], name=r['name'], slug=slug,
                description=r['description'], address=r['address'],
                city=r['city'], phone=r['phone'], email=r['email'],
                cuisine_type=r['cuisine_type'],
                opening_time='10:00:00', closing_time='23:00:00',
                is_active=True, is_approved=True,
                average_rating=Decimal(str(r['average_rating'])),
                total_reviews=r['total_reviews'],
                minimum_order=Decimal(str(r['minimum_order'])),
                delivery_fee=Decimal(str(r['delivery_fee'])),
                estimated_delivery_time=r['estimated_delivery_time'],
            )
            restaurant_objs.append(rest)

        self.stdout.write(f'  Created {len(restaurant_objs)} restaurants')

        # ── Menu Categories & Items ────────────────────────────
        MENUS = {
            'Karachi Biryani House': {
                'Biryani': [
                    ('Chicken Biryani', 350, 'Aromatic basmati rice layered with tender chicken and special spices', False, True),
                    ('Mutton Biryani', 550, 'Slow-cooked mutton with fragrant rice and saffron', False, True),
                    ('Sindhi Biryani', 400, 'Spicy Sindhi-style biryani with potatoes and tomatoes', False, True),
                ],
                'Karahi': [
                    ('Chicken Karahi (Half)', 800, 'Fresh chicken cooked in tomatoes, green chillies and ginger', False, True),
                    ('Mutton Karahi (Half)', 1200, 'Tender mutton in traditional karahi masala', False, True),
                ],
                'BBQ': [
                    ('Beef Seekh Kebab (6 pcs)', 450, 'Juicy minced beef kebabs grilled over charcoal', False, True),
                    ('Chicken Tikka (8 pcs)', 500, 'Marinated chicken pieces grilled to perfection', False, False),
                    ('Reshmi Kebab (6 pcs)', 400, 'Soft and creamy chicken kebabs', False, False),
                ],
                'Drinks': [
                    ('Lassi', 120, 'Traditional yogurt drink, sweet or salty', True, False),
                    ('Raita', 80, 'Cool yogurt with cucumber and mint', True, False),
                ],
            },
            'Lahore Tikka Corner': {
                'Tikka & BBQ': [
                    ('Chicken Tikka (8 pcs)', 480, 'Smoky charcoal-grilled chicken tikka', False, False),
                    ('Malai Boti (8 pcs)', 550, 'Creamy marinated chicken cubes', False, False),
                    ('Lamb Chops (4 pcs)', 900, 'Tender lamb chops with special dry rub', False, True),
                    ('Mixed Grill Platter', 1500, 'Assortment of tikka, boti, seekh kebab and chops', False, True),
                ],
                'Karahi': [
                    ('Chicken Karahi', 850, 'Lahori-style karahi with extra ginger and green chillies', False, True),
                    ('Kata Kat', 700, 'Brain and kidney masala cooked on tawa', False, True),
                ],
                'Naan & Roti': [
                    ('Tandoori Naan', 30, 'Fresh clay oven baked naan', True, False),
                    ('Garlic Naan', 60, 'Naan topped with garlic butter', True, False),
                    ('Roghni Naan', 50, 'Buttery soft naan with sesame seeds', True, False),
                ],
                'Beverages': [
                    ('Mint Margarita', 150, 'Refreshing lime and mint cooler', True, False),
                    ('Doodh Patti Chai', 80, 'Strong milk tea, Lahori style', True, False),
                ],
            },
            'Pizza Planet': {
                'Classic Pizzas': [
                    ('Margherita (Large)', 799, 'Fresh mozzarella, tomato sauce, and basil', True, False),
                    ('Pepperoni Pizza (Large)', 999, 'Loaded with spicy pepperoni and extra cheese', False, False),
                    ('BBQ Chicken Pizza (Large)', 1099, 'Grilled chicken, BBQ sauce, onions, and peppers', False, False),
                ],
                'Premium Pizzas': [
                    ('Meat Lovers (Large)', 1299, 'Pepperoni, sausage, beef, and chicken', False, False),
                    ('Fajita Pizza (Large)', 1199, 'Chicken fajita with capsicum, onions, and jalapenos', False, True),
                ],
                'Sides': [
                    ('Garlic Bread (4 pcs)', 299, 'Toasted bread with garlic butter and herbs', True, False),
                    ('Chicken Wings (8 pcs)', 499, 'Crispy wings with your choice of sauce', False, False),
                    ('Coleslaw', 149, 'Fresh creamy coleslaw', True, False),
                ],
                'Drinks': [
                    ('Soft Drink (500ml)', 100, 'Coca-Cola, Pepsi, Sprite, or 7Up', True, False),
                    ('Fresh Juice', 200, 'Orange, mango, or watermelon', True, False),
                ],
            },
            'Dragon Palace': {
                'Starters': [
                    ('Chicken Corn Soup', 250, 'Creamy chicken and sweetcorn soup', False, False),
                    ('Spring Rolls (6 pcs)', 300, 'Crispy vegetable spring rolls with sweet chilli sauce', True, False),
                    ('Dynamite Prawns', 550, 'Crispy prawns in spicy mayo sauce', False, True),
                ],
                'Main Course': [
                    ('Chicken Manchurian', 450, 'Deep-fried chicken in tangy Manchurian sauce', False, False),
                    ('Beef Chilli Dry', 500, 'Wok-tossed beef with peppers and chillies', False, True),
                    ('Chicken Fried Rice', 380, 'Wok-fried rice with egg and chicken', False, False),
                    ('Chow Mein Noodles', 400, 'Stir-fried noodles with vegetables and chicken', False, False),
                ],
                'Specialties': [
                    ('Szechuan Chicken', 520, 'Spicy Szechuan-style chicken with peanuts', False, True),
                    ('Black Pepper Beef', 580, 'Tender beef in aromatic black pepper sauce', False, False),
                ],
            },
            'Burger Lab Express': {
                'Smashed Burgers': [
                    ('Classic Smash Burger', 299, 'Double smashed patties, American cheese, pickles, and special sauce', False, False),
                    ('Spicy Crunch Burger', 349, 'Crispy chicken with jalapeno slaw and hot sauce', False, True),
                    ('BBQ Bacon Burger', 399, 'Beef patty, beef bacon, cheddar, and smoky BBQ', False, False),
                    ('Mushroom Swiss Burger', 379, 'Beef patty with sauteed mushrooms and Swiss cheese', False, False),
                ],
                'Loaded Fries': [
                    ('Classic Fries', 150, 'Crispy golden fries with ketchup', True, False),
                    ('Loaded Cheese Fries', 250, 'Fries smothered in cheese sauce and jalapenos', True, False),
                    ('Truffle Fries', 300, 'Fries with truffle oil and parmesan', True, False),
                ],
                'Shakes & Drinks': [
                    ('Chocolate Shake', 250, 'Thick and creamy chocolate milkshake', True, False),
                    ('Oreo Shake', 280, 'Cookies and cream shake with whipped cream', True, False),
                    ('Soft Drink', 80, 'Your choice of carbonated beverage', True, False),
                ],
            },
            'Meetha Ghar': {
                'Traditional Mithai': [
                    ('Gulab Jamun (6 pcs)', 200, 'Soft milk dumplings soaked in rose-flavored sugar syrup', True, False),
                    ('Jalebi (250g)', 180, 'Crispy, syrupy spirals of pure sweetness', True, False),
                    ('Rasgulla (6 pcs)', 220, 'Soft cottage cheese balls in sugar syrup', True, False),
                    ('Barfi Assorted (500g)', 400, 'Assortment of milk barfi, pista barfi, and kaju barfi', True, False),
                ],
                'Modern Desserts': [
                    ('Kunafa', 350, 'Crispy shredded pastry with cream cheese and pistachio', True, False),
                    ('Rabri Falooda', 250, 'Thick rabri with vermicelli, ice cream and rose syrup', True, False),
                ],
                'Ice Cream': [
                    ('Kulfi Stick', 80, 'Traditional Pakistani ice cream in mango or pistachio', True, False),
                    ('Ice Cream Sundae', 300, 'Three scoops with chocolate sauce, nuts, and cherry', True, False),
                ],
            },
            'Chaaye Khana': {
                'Nashta (Breakfast)': [
                    ('Paratha with Omelette', 200, 'Flaky paratha served with masala omelette and chutney', True, False),
                    ('Halwa Puri', 250, 'Traditional Sunday nashta with channay, halwa, and puri', True, False),
                    ('Anda Paratha', 180, 'Egg-stuffed crispy paratha', True, False),
                ],
                'Chai & Beverages': [
                    ('Doodh Patti Chai', 80, 'Strong milk tea brewed the traditional way', True, False),
                    ('Kashmiri Chai', 120, 'Pink tea with nuts and cream', True, False),
                    ('Kahwa', 100, 'Green tea with cardamom, cinnamon and saffron', True, False),
                ],
                'Snacks': [
                    ('Samosa (2 pcs)', 80, 'Crispy pastry filled with spiced potatoes', True, True),
                    ('Pakora Plate', 120, 'Assorted fritters with green chutney', True, False),
                    ('Dahi Bhalla', 150, 'Lentil dumplings in yogurt with tamarind chutney', True, False),
                ],
            },
            'Al-Habib Restaurant': {
                'Signature Dishes': [
                    ('Nihari (Half)', 500, '12-hour slow-cooked beef nihari with bone marrow', False, True),
                    ('Paye (Half)', 450, 'Traditional goat trotters stew cooked overnight', False, False),
                    ('Haleem (Bowl)', 350, 'Rich lentil and meat stew, Hyderabadi style', False, False),
                ],
                'Handi & Karahi': [
                    ('Chicken Handi', 900, 'Boneless chicken in rich creamy gravy', False, False),
                    ('Mutton Karahi (Full)', 2200, 'Premium mutton karahi for the whole family', False, True),
                    ('Daal Gosht', 650, 'Lentils cooked with tender mutton pieces', False, False),
                ],
                'Rice': [
                    ('Chicken Pulao', 400, 'Fragrant rice cooked in chicken stock with whole spices', False, False),
                    ('Mutton Biryani (Full)', 1800, 'Family-size biryani with premium mutton', False, True),
                ],
                'Bread': [
                    ('Tandoori Roti', 20, 'Whole wheat flatbread from clay oven', True, False),
                    ('Naan', 30, 'White flour bread from tandoor', True, False),
                ],
            },
        }

        total_items = 0
        for rest_obj in restaurant_objs:
            menu_data = MENUS.get(rest_obj.name, {})
            sort_order = 0
            for cat_name, items in menu_data.items():
                mc = MenuCategory.objects.create(
                    restaurant=rest_obj, name=cat_name,
                    sort_order=sort_order, is_active=True,
                )
                sort_order += 1
                for item_name, price, desc, is_veg, is_spicy in items:
                    slug = slugify(item_name)
                    base_slug = slug
                    n = 1
                    while MenuItem.objects.filter(restaurant=rest_obj, slug=slug).exists():
                        slug = f'{base_slug}-{n}'
                        n += 1
                    # Randomly add discounted price to ~20% of items
                    disc = None
                    if random.random() < 0.2:
                        disc = Decimal(str(int(price * 0.85)))
                    MenuItem.objects.create(
                        category=mc, restaurant=rest_obj,
                        name=item_name, slug=slug, description=desc,
                        price=Decimal(str(price)), discounted_price=disc,
                        is_available=True, is_vegetarian=is_veg, is_spicy=is_spicy,
                        preparation_time=random.choice([10, 15, 20, 25, 30]),
                    )
                    total_items += 1

        self.stdout.write(f'  Created {total_items} menu items')

        # ── Orders ─────────────────────────────────────────────
        ORDER_STATUSES = ['delivered', 'delivered', 'delivered', 'delivered', 'delivered',
                          'delivered', 'delivered', 'pending', 'confirmed', 'preparing',
                          'ready', 'picked_up', 'cancelled']
        PAYMENT_METHODS = ['cod', 'cod', 'jazzcash', 'easypaisa', 'card']

        orders_created = []
        now = timezone.now()

        for i in range(20):
            customer = random.choice(customers)
            rest = random.choice(restaurant_objs)
            items = list(MenuItem.objects.filter(restaurant=rest, is_available=True))
            if len(items) < 2:
                continue

            order_items = random.sample(items, min(random.randint(2, 4), len(items)))
            total = sum(float(it.discounted_price or it.price) for it in order_items)
            qty_map = {it.id: random.randint(1, 3) for it in order_items}
            total = sum(float(it.discounted_price or it.price) * qty_map[it.id] for it in order_items)

            delivery_fee = float(rest.delivery_fee)
            tax = round(total * 0.05, 2)
            grand_total = round(total + delivery_fee + tax, 2)

            status = random.choice(ORDER_STATUSES)
            pm = random.choice(PAYMENT_METHODS)
            ps = 'paid' if status == 'delivered' or pm != 'cod' else 'pending'
            if status == 'cancelled':
                ps = 'pending'

            created_at = now - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
            driver = random.choice(drivers) if status in ('picked_up', 'delivered') else None

            order = Order.objects.create(
                user=customer, restaurant=rest, driver=driver,
                status=status, payment_method=pm, payment_status=ps,
                total_amount=Decimal(str(round(total, 2))),
                delivery_fee=Decimal(str(delivery_fee)),
                tax_amount=Decimal(str(tax)),
                grand_total=Decimal(str(grand_total)),
                delivery_address=f'{random.randint(1,500)} {random.choice(["Main Road","Street","Block","Sector"])} {random.randint(1,20)}',
                delivery_city=customer.city,
            )
            # Backdate
            Order.objects.filter(pk=order.pk).update(created_at=created_at)
            order.refresh_from_db()

            for it in order_items:
                OrderItem.objects.create(
                    order=order, menu_item=it,
                    quantity=qty_map[it.id],
                    price=it.discounted_price or it.price,
                )
            orders_created.append(order)

        self.stdout.write(f'  Created {len(orders_created)} orders')

        # ── Reviews ────────────────────────────────────────────
        REVIEW_COMMENTS = [
            'Amazing biryani! Best in Karachi. Will definitely order again.',
            'Delivery was a bit late but food was hot and delicious.',
            'Great taste, generous portions. Highly recommended!',
            'The tikka was perfectly grilled. Loved every bite.',
            'Good food but packaging could be better.',
            'Absolutely fantastic! My go-to restaurant now.',
            'Fresh ingredients and authentic flavors. 5 stars!',
            'Decent food for the price. Nothing extraordinary.',
            'The naan was fresh from the tandoor. Loved it!',
            'Quick delivery and everything was still hot. Impressed!',
            'Best pizza in Islamabad, hands down.',
            'The burger was juicy and the fries were crispy. Perfect combo!',
            'Kunafa was heavenly. Will order again for sure.',
            'The chai here is the real deal. Reminds me of home.',
            'Nihari was slow-cooked to perfection. Outstanding!',
        ]

        delivered_orders = [o for o in orders_created if o.status == 'delivered']
        reviews_created = 0

        for order in delivered_orders[:15]:
            if Review.objects.filter(order=order).exists():
                continue
            rating = random.choices([5, 4, 3, 5, 4, 4, 5], k=1)[0]
            Review.objects.create(
                user=order.user, restaurant=order.restaurant, order=order,
                rating=rating,
                comment=random.choice(REVIEW_COMMENTS),
            )
            reviews_created += 1

        # Update restaurant ratings from actual reviews
        for rest in restaurant_objs:
            reviews = Review.objects.filter(restaurant=rest)
            if reviews.exists():
                from django.db.models import Avg
                avg = reviews.aggregate(a=Avg('rating'))['a']
                rest.average_rating = Decimal(str(round(avg, 2)))
                rest.total_reviews = reviews.count()
                rest.save(update_fields=['average_rating', 'total_reviews'])

        self.stdout.write(f'  Created {reviews_created} reviews')

        self.stdout.write(self.style.SUCCESS(
            f'\nSeed complete! Created {len(customers)+len(owners)+len(drivers)+1} users, '
            f'{len(restaurant_objs)} restaurants, {total_items} menu items, '
            f'{len(orders_created)} orders, {reviews_created} reviews\n'
            f'\nLogin credentials (all passwords: test1234):\n'
            f'  Customer:  ahmed@test.com\n'
            f'  Owner:     bilal@test.com\n'
            f'  Driver:    kamran@test.com\n'
            f'  Admin:     admin@feastdash.pk\n'
        ))
