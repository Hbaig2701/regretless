-- Regretless Seed Data
-- 72 curated experiences: 6 per category, 12 categories

INSERT INTO experiences (title, description, category_id, time_estimate, price_estimate, party_size, environment, is_curated) VALUES

-- ============================================
-- Category 1: Creativity & Self-Expression
-- ============================================
('Perform a short story at an open mic night', 'Write a 3-minute personal story and read it aloud at a local open mic event.', 1, 3, 0, 1, 'indoor', true),
('Paint a self-portrait without looking at it', 'Set a timer for 30 minutes and paint a self-portrait using only your non-dominant hand without peeking.', 1, 1, 15, 1, 'indoor', true),
('Write and mail a handwritten poem to a stranger', 'Compose an original poem and mail it anonymously to a random address in your city with a kind note.', 1, 2, 5, 1, 'indoor', true),
('Busk with a talent on a busy street corner', 'Pick any skill you have—singing, juggling, drawing—and perform it on a street corner for one hour.', 1, 2, 0, 1, 'outdoor', true),
('Create a short film using only your phone', 'Write, shoot, and edit a 2-minute short film entirely on your smartphone and share it with a friend.', 1, 4, 0, 1, 'outdoor', true),
('Fill an entire sketchbook page in a coffee shop', 'Sit in a coffee shop and fill a full page with drawings of the people, objects, and scenes around you.', 1, 2, 5, 1, 'indoor', true),

-- ============================================
-- Category 2: Adventure & Novelty
-- ============================================
('Explore a neighborhood you have never visited', 'Pick a neighborhood in your city you have never been to and spend a half day wandering with no plan.', 2, 4, 10, 1, 'outdoor', true),
('Take a train to the next town and walk around', 'Board a train to the nearest town you have never visited, explore for a few hours, and come back the same day.', 2, 6, 25, 1, 'outdoor', true),
('Say yes to every invitation for an entire day', 'For one full day, accept every social invitation or spontaneous opportunity that comes your way.', 2, 8, 20, 2, 'outdoor', true),
('Eat at a restaurant where you cannot read the menu', 'Find a restaurant serving cuisine from a culture unfamiliar to you and order by pointing at random items.', 2, 2, 30, 2, 'indoor', true),
('Wake up for sunrise at the highest point in your city', 'Set an alarm, get to the highest accessible viewpoint in your area, and watch the entire sunrise in silence.', 2, 2, 0, 1, 'outdoor', true),
('Spend an afternoon following a hand-drawn map', 'Draw a rough map of your area from memory, then follow it on foot and see where your inaccuracies lead you.', 2, 3, 0, 1, 'outdoor', true),

-- ============================================
-- Category 3: Food & Culture
-- ============================================
('Cook a full meal from a cuisine you have never tried', 'Pick a country you know nothing about, research a traditional recipe, buy the ingredients, and cook it from scratch.', 3, 3, 20, 1, 'indoor', true),
('Attend a cultural festival or religious service outside your tradition', 'Find a public cultural celebration or religious service from a tradition different from yours and attend with an open mind.', 3, 3, 0, 1, 'indoor', true),
('Host a potluck where every dish must be from a different country', 'Invite friends to a potluck with one rule: each person brings a dish from a different country.', 3, 4, 15, 4, 'indoor', true),
('Visit an ethnic grocery store and buy five things you cannot identify', 'Go to an international grocery store, buy five unfamiliar items, and figure out how to use them at home.', 3, 2, 15, 1, 'indoor', true),
('Eat a meal in complete silence with a friend', 'Share a full sit-down meal with someone you care about without speaking a single word, communicating only through gestures.', 3, 2, 20, 2, 'indoor', true),
('Take a street food walking tour of your city', 'Map out at least four street food vendors in your city and walk between them, trying one item at each stop.', 3, 3, 25, 2, 'outdoor', true),

-- ============================================
-- Category 4: Social Courage
-- ============================================
('Start a conversation with a stranger on a park bench', 'Sit on a park bench next to someone and start a genuine conversation that lasts at least ten minutes.', 4, 1, 0, 2, 'outdoor', true),
('Give a specific compliment to ten strangers in one day', 'Approach ten different strangers throughout the day and give each one a genuine, specific compliment.', 4, 2, 0, 1, 'outdoor', true),
('Ask a local shop owner about the story behind their business', 'Walk into a small local business and ask the owner how they got started—listen to the full story.', 4, 1, 0, 1, 'indoor', true),
('Sit alone at a bar and make a new friend before you leave', 'Go to a bar solo, order a drink, and do not leave until you have had a meaningful conversation with someone new.', 4, 2, 15, 1, 'indoor', true),
('Organize a game night with people you barely know', 'Invite three or more acquaintances—not close friends—to your place for a board game or card game night.', 4, 4, 10, 4, 'indoor', true),
('Ask someone you admire to grab coffee with you', 'Identify someone in your community you look up to, reach out, and invite them for a one-on-one coffee.', 4, 2, 10, 2, 'indoor', true),

-- ============================================
-- Category 5: Love & Relationships
-- ============================================
('Write a letter to someone you love and read it to them in person', 'Write an honest letter expressing what someone means to you, then sit down and read it to them face to face.', 5, 2, 0, 2, 'indoor', true),
('Plan a surprise outing for a friend based on their interests', 'Think about what a friend loves, plan a complete surprise day for them, and execute it without revealing the plan.', 5, 5, 30, 2, 'outdoor', true),
('Call a family member you have not spoken to in over a year', 'Pick up the phone and call a family member you have lost touch with—stay on the line for at least thirty minutes.', 5, 1, 0, 1, 'indoor', true),
('Spend an entire evening asking someone deep questions', 'Use a set of deep conversation prompts and spend an uninterrupted evening learning something new about someone close to you.', 5, 3, 0, 2, 'indoor', true),
('Recreate your first date or first hangout with someone', 'Go back to the same place and recreate the experience of the first time you spent time with a close friend or partner.', 5, 3, 25, 2, 'outdoor', true),
('Leave hidden appreciation notes for people in your life', 'Write five short notes of appreciation and hide them where different people in your life will find them throughout the week.', 5, 1, 5, 1, 'indoor', true),

-- ============================================
-- Category 6: Beauty & Awe
-- ============================================
('Watch an entire sunset without your phone', 'Find a good vantage point, leave your phone in your pocket, and watch the full sunset from start to finish.', 6, 1, 0, 1, 'outdoor', true),
('Visit a museum and spend thirty minutes with one piece of art', 'Go to a museum and instead of browsing, choose a single artwork and sit with it for a full thirty minutes.', 6, 2, 15, 1, 'indoor', true),
('Lie on your back and watch the stars for an hour', 'Drive or walk to a spot with low light pollution and spend an hour lying on your back looking at the night sky.', 6, 2, 0, 1, 'outdoor', true),
('Walk through a botanical garden and sketch your favorite plant', 'Visit a botanical garden, find the one plant that captivates you most, and sit down to draw it in detail.', 6, 3, 10, 1, 'outdoor', true),
('Listen to a full symphony or album with your eyes closed', 'Choose a classical symphony or a concept album, put on headphones, close your eyes, and listen without interruption.', 6, 2, 0, 1, 'indoor', true),
('Find the oldest tree in your area and sit beneath it', 'Research the oldest or most remarkable tree near you, travel to it, and spend thirty quiet minutes in its presence.', 6, 2, 0, 1, 'outdoor', true),

-- ============================================
-- Category 7: Knowledge & Learning
-- ============================================
('Attend a free public lecture or workshop on a topic you know nothing about', 'Find a free lecture, workshop, or talk at a library, university, or community center on an unfamiliar subject and attend it.', 7, 2, 0, 1, 'indoor', true),
('Spend an afternoon learning a skill from a YouTube tutorial', 'Pick a hands-on skill—lockpicking, origami, calligraphy—and spend a full afternoon practicing it from online tutorials.', 7, 4, 10, 1, 'indoor', true),
('Read an entire book in a single day', 'Choose a short book (under 200 pages) on a topic that intimidates you and read it cover to cover in one sitting.', 7, 6, 15, 1, 'indoor', true),
('Interview an elder about their life story', 'Find an older person in your community—a grandparent, neighbor, or volunteer—and ask them to share the story of their life.', 7, 2, 0, 2, 'indoor', true),
('Visit a courthouse and watch a trial for an hour', 'Go to your local courthouse, find a public trial in session, and sit quietly in the gallery observing the proceedings.', 7, 2, 0, 1, 'indoor', true),
('Learn to say ten phrases in a language you do not speak', 'Pick a language completely foreign to you and spend an evening learning ten useful phrases well enough to say them from memory.', 7, 2, 0, 1, 'indoor', true),

-- ============================================
-- Category 8: Health & Physicality
-- ============================================
('Take a cold plunge in a natural body of water', 'Find a lake, river, or ocean near you and fully submerge yourself in cold water for at least sixty seconds.', 8, 1, 0, 1, 'outdoor', true),
('Hike a trail you have never been on until you are tired', 'Pick a new trail, start walking, and do not turn back until your body tells you it is time—then enjoy the return.', 8, 5, 0, 1, 'outdoor', true),
('Take a beginner class in a martial art or combat sport', 'Sign up for a single drop-in session of boxing, jiu-jitsu, judo, or another martial art you have never tried.', 8, 2, 20, 1, 'indoor', true),
('Do a full yoga session outdoors at sunrise', 'Follow a guided yoga session in a park or on a rooftop as the sun comes up.', 8, 1, 0, 1, 'outdoor', true),
('Challenge a friend to a physical activity neither of you has tried', 'Pick something like rock climbing, paddleboarding, or a dance class and do it together for the first time.', 8, 3, 30, 2, 'outdoor', true),
('Spend an entire day without sitting in a chair', 'From morning to night, avoid chairs entirely—stand, sit on the floor, walk, squat, or lie down instead.', 8, 8, 0, 1, 'outdoor', true),

-- ============================================
-- Category 9: Courage & Self-Transformation
-- ============================================
('Do something you have been putting off for over a month', 'Identify the one task you have been avoiding the longest and do not go to bed until it is done.', 9, 3, 0, 1, 'indoor', true),
('Introduce yourself at a meetup or group where you know nobody', 'Find a meetup, class, or community event, show up alone, and introduce yourself to at least three people.', 9, 2, 0, 1, 'indoor', true),
('Spend an entire day without telling a single lie', 'For 24 hours, commit to radical honesty—no white lies, no exaggerations, no omissions.', 9, 8, 0, 1, 'indoor', true),
('Ask for a discount or upgrade somewhere you normally would not', 'At a hotel, coffee shop, or store, politely ask for a discount or upgrade you are not entitled to and see what happens.', 9, 1, 0, 1, 'indoor', true),
('Record a video of yourself giving a pep talk and watch it', 'Set up your phone camera, give yourself a two-minute motivational talk, then sit down and watch the recording.', 9, 1, 0, 1, 'indoor', true),
('Sign up for a competition or contest outside your skill set', 'Find an amateur competition—trivia night, karaoke contest, fun run—in an area where you have no expertise and enter it.', 9, 3, 10, 1, 'outdoor', true),

-- ============================================
-- Category 10: Contribution & Purpose
-- ============================================
('Volunteer for a full shift at a local food bank', 'Sign up for a volunteer shift at a food bank or soup kitchen and work the entire shift from start to finish.', 10, 4, 0, 1, 'indoor', true),
('Write five genuine online reviews for small businesses you love', 'Think of five small businesses that have made your life better and write detailed, heartfelt reviews for each one.', 10, 1, 0, 1, 'indoor', true),
('Pick up litter in your neighborhood for an hour', 'Grab a bag and gloves and spend a full hour cleaning up trash from the streets, parks, or waterways near your home.', 10, 1, 5, 1, 'outdoor', true),
('Teach someone a skill you take for granted', 'Identify a skill you have—cooking, budgeting, coding—and spend an afternoon teaching it to someone who wants to learn.', 10, 3, 0, 2, 'indoor', true),
('Buy coffee for the next five people in line behind you', 'At a coffee shop, pay for the orders of the next five customers and leave before they can thank you.', 10, 1, 30, 1, 'indoor', true),
('Spend a day helping a neighbor with a project', 'Knock on a neighbor''s door, ask if they need help with anything—yard work, moving furniture, errands—and commit to a full day of help.', 10, 6, 0, 2, 'outdoor', true),

-- ============================================
-- Category 11: Play & Joy
-- ============================================
('Have a water balloon fight with friends in a park', 'Fill up a bucket of water balloons, invite friends to a park, and have an all-out battle like you did as a kid.', 11, 2, 10, 4, 'outdoor', true),
('Build the most elaborate blanket fort you can', 'Use every blanket, pillow, and cushion in your home to build the most impressive fort possible, then spend the evening inside it.', 11, 3, 0, 2, 'indoor', true),
('Go to a playground and use every piece of equipment', 'Visit a playground and actually play on the swings, slides, monkey bars, and everything else without worrying about looks.', 11, 1, 0, 1, 'outdoor', true),
('Spend an entire evening playing childhood board games', 'Dig out or buy classic board games from your childhood and play them for a full evening with total commitment.', 11, 4, 10, 3, 'indoor', true),
('Have a dance party in your living room for thirty minutes', 'Create a playlist of songs that make you move, clear the furniture, and dance like nobody is watching for a full half hour.', 11, 1, 0, 1, 'indoor', true),
('Fly a kite until you get it to stay up for five minutes', 'Buy or make a kite, go to an open field, and do not leave until you have kept it airborne for at least five straight minutes.', 11, 2, 10, 1, 'outdoor', true),

-- ============================================
-- Category 12: Career & Future Self
-- ============================================
('Shadow someone for a day in a career you are curious about', 'Reach out to someone in a field you have wondered about and ask to follow them for a day to see what the work is really like.', 12, 8, 0, 2, 'indoor', true),
('Write a letter to yourself ten years from now', 'Sit down and write a detailed letter to your future self describing your current hopes, fears, and plans—then seal it with a date.', 12, 1, 0, 1, 'indoor', true),
('Attend a networking event and have three real conversations', 'Go to a professional networking event and have at least three conversations that go beyond surface-level small talk.', 12, 3, 10, 1, 'indoor', true),
('Build something and publish it online in one day', 'Pick a small project—a website, a blog post, a tool—build it from scratch, and publish it publicly before midnight.', 12, 8, 0, 1, 'indoor', true),
('Ask your manager or mentor for brutally honest feedback', 'Schedule a one-on-one and explicitly ask for the most honest, unfiltered feedback they can give you about your work and growth.', 12, 1, 0, 2, 'indoor', true),
('Spend a morning doing the work you wish you did for a living', 'Block off an entire morning and spend it doing the creative or professional work you daydream about—treat it like a real job.', 12, 4, 0, 1, 'indoor', true);
