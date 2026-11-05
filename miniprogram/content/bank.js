// 原创模拟题库：按四六级「仔细阅读」的官方规格编写，不含任何真题原文。
// 规格依据：仔细阅读每篇四级 300-350 词、六级 400-450 词，每篇 5 题，
// 考查主旨、细节、推断、态度与词义；文章多改编自《经济学人》《科学美国人》
// 《大西洋月刊》《纽约时报》《卫报》一类外刊，题材集中在科普、生态、健康、
// 社会文化、经济消费与青年成长。六级另加抽象名词化、让步转折与多重修饰。
// 词汇允许少量超纲，这是真实考题的常态，不作为删改理由。
const LEVELS = [
  { key: 'cet4', label: '四级', full: 'CET-4', desc: '每篇 300-350 词，句式对齐仔细阅读' },
  { key: 'cet6', label: '六级', full: 'CET-6', desc: '每篇 400-450 词，长难句与抽象话题' }
]

const ARTICLES = [
  {
    id: 'c4-01',
    level: 'cet4',
    title: 'What Sleep Does to What You Learned',
    topic: '健康 · 记忆',
    source: '原创模拟 · 对齐四级',
    text: `Every semester, thousands of students decide that the week before an examination is the right time to give up sleep. There is too much to review, they reason, and staying awake for two more hours must be worth more than dreaming. The logic feels practical, but it treats sleep as a competitor to learning rather than as part of it.

A classic experiment makes the point clearly. Volunteers learned a list of word pairs and were then divided into two groups. One group slept for eight hours; the other stayed awake for the same period. When both groups were tested the next morning, the sleepers remembered noticeably more, and their advantage remained a week later. Sleep had not simply protected the material from fading. It had reorganised it.

Brain imaging helps explain why. During deep sleep, the hippocampus, a structure that stores new experiences quickly, replays them to the cortex, which holds knowledge for the long term. This conversation between the two regions happens in short bursts, hundreds of times a night. When the process is interrupted, the transfer is incomplete, and the information is left in a form that is easy to lose.

More recent work adds a warning. Sleep does not only save what we have learned; it also clears away connections that seem less useful. A night of good sleep therefore sharpens the memory of what matters and weakens the rest. Students who study until three in the morning may keep a great deal in mind for a day, but their brains have had little chance to decide what deserves to stay.

The practical advice is unglamorous. Go to bed at roughly the same time, keep the room dark, and put the phone out of reach. None of these habits can replace careful study, but they make study more effective. A student who protects seven hours of sleep is not being lazy; that student is giving the brain the time it needs to finish the lesson.`
  },
  {
    id: 'c4-02',
    level: 'cet4',
    title: 'Why a Single Tree Can Cool a Whole Street',
    topic: '生态 · 城市',
    source: '原创模拟 · 对齐四级',
    text: `On a summer afternoon, the temperature of a street lined with trees can be several degrees lower than that of a bare street only a block away. Most people notice the shade and stop there. The difference, however, comes from more than shadow.

Leaves lose water through tiny pores, a process called transpiration. As the water turns into vapour, it absorbs heat from the surrounding air, cooling the surface of the leaf and the air close to it. A large tree can release hundreds of litres of water on a hot day, which is why the air beneath its crown feels fresh rather than simply dark.

A study of several European cities found that neighbourhoods with more than thirty percent tree cover were up to four degrees cooler during heatwaves than neighbourhoods with less than ten percent. The effect was strongest in narrow streets, where buildings on both sides trap heat and reduce the movement of air. Trees placed along those streets did more than trees in open parks, because they cooled the space where people actually walked.

The benefits do not end with temperature. Shade reduces the energy used by air conditioners, and cooler streets encourage people to walk and talk outside. Studies in several cities have linked tree planting to lower stress and stronger social contact, although the exact reasons remain debated.

There are limits. Trees need water, and young ones need years of care before they provide much shade. Species must be chosen for the local climate, since a tree that struggles in dry soil will die before it matures. Some cities have responded by planting fewer, larger trees instead of many small ones, and by giving residents a say in where they go.

The lesson is that cooling a city requires patience and planning, not a single dramatic project. A tree planted this year is an investment that the next generation will enjoy, which may be exactly why it is so easy to postpone.`
  },
  {
    id: 'c4-03',
    level: 'cet4',
    title: 'The Plastic We Drink Without Noticing',
    topic: '环境 · 健康',
    source: '原创模拟 · 对齐四级',
    text: `Microplastics have been found in rivers, in rain and, according to a growing number of studies, in bottled water. The discovery usually produces two reactions: alarm and dismissal. Neither is a useful guide to what the evidence actually shows.

The particles in question are smaller than five millimetres, and many are far smaller than that. Researchers detect them by filtering water and examining the residue with special instruments. Because the methods differ from study to study, the numbers vary widely, and comparisons between brands should be treated with caution.

What the research does suggest is that bottled water often contains more particles than tap water, largely because of the bottle itself. Squeezing the plastic, opening and closing the cap, and storing the bottle in a warm place can all release fragments. The amount is still tiny compared with the plastic we shed from clothing and packaging every day.

The health question is harder. Scientists know that some particles are small enough to pass through the walls of the intestine, and that they have been found in human blood. They do not yet know whether the quantities involved cause harm. It is important to say this clearly, because a vague warning can create fear without changing behaviour.

There are sensible responses that do not require panic. Carry a reusable bottle made of glass or steel. Avoid leaving plastic bottles in hot cars. Support systems that improve tap water, since the alternative for many families is not clean water but expensive bottled water of uncertain quality. And treat research findings as a moving picture rather than a final answer.

The larger point is that plastic is useful, cheap and everywhere, and that its costs are often invisible until someone looks for them. The reasonable response is neither to pretend the problem does not exist nor to abandon a material that modern medicine depends on. It is to reduce unnecessary exposure and to keep measuring.`
  },
  {
    id: 'c4-04',
    level: 'cet4',
    title: 'When Recommendations Decide for You',
    topic: '科技 · 媒体',
    source: '原创模拟 · 对齐四级',
    text: `Ask people how they choose what to watch or read, and most will say that they decide for themselves. In practice, a large share of those decisions is shaped by systems that observe what we click, how long we pause and what we skip. Recommendation algorithms have become a quiet form of editing, and their influence deserves more attention than it usually receives.

The technology itself is not mysterious. A platform collects signals about behaviour, compares them with patterns from millions of other users, and predicts what will hold your attention next. The prediction is often good, which is why the service feels helpful. It is also why the same system can narrow what we see without ever telling us that a choice was made.

Critics often describe this as a filter bubble, a term that suggests users are trapped in a closed world. The reality is more complicated. Most people encounter a mixture of views, especially on large platforms, but the mixture is arranged to keep them engaged. Content that provokes a strong reaction travels further, not because it is true but because it is difficult to ignore.

The consequences are easiest to see among young users. A teenager who watches one video about fitness may soon be shown supplements, extreme diets and claims that no doctor would support. Each step is small, and each seems to follow from the last. Taken together, they can turn an ordinary interest into a distorted picture of how the body works.

Regulation is beginning to catch up. Some countries now require platforms to explain why a piece of content was recommended and to offer a version of the service that is not based on profiling. These rules are imperfect, but they establish a principle that matters: users should be able to see the machinery that shapes their attention.

Individual habits help as well. Occasionally search for something you did not expect to enjoy; follow a source that disagrees with you; notice when a suggestion feels too easy. None of this will defeat an algorithm, but it keeps the choice from disappearing entirely.`
  },
  {
    id: 'c4-05',
    level: 'cet4',
    title: 'The Rise of the Repair Cafe',
    topic: '消费 · 社区',
    source: '原创模拟 · 对齐四级',
    text: `In a small community hall on a Saturday morning, a dozen people sit at tables with broken lamps, torn jackets and silent radios. Volunteers with toolboxes move between them, asking questions and offering advice. Nothing is for sale. The event is a repair cafe, and its popularity says something about how people feel about the things they own.

Walking in with a broken lamp, a visitor is asked what happened rather than what it cost. The idea began in the Netherlands and has spread to thousands of towns. The rules are simple: bring a broken object, sit with the person who fixes it, and learn what is happening. Visitors are not customers waiting for a service; they are participants in a conversation about how things work.

There are practical reasons for the growth. Many products are designed so that repairing them is difficult or expensive. A replacement part may cost almost as much as a new device, and some manufacturers refuse to supply parts at all. Repair cafes keep usable objects out of landfill and give owners an alternative to throwing something away.

There is also a social reason. In cities where neighbours may never speak, a shared table creates an easy form of contact. A retired engineer who fixes a kettle is also passing on knowledge that would otherwise disappear. A student who learns to replace a zip gains a skill that no application can provide.

The movement has limits. Volunteers cannot repair everything, and safety rules prevent them from touching some electrical faults. Critics point out that repairing a single toaster will not solve a global waste problem, and they are right. But the cafe is less important for the kilos it saves than for the expectation it creates.

That expectation is beginning to influence policy. Several governments now require manufacturers to provide spare parts and repair instructions for certain products. The change is slow and uneven, yet it reflects a shift in how consumers see ownership: not as a right to use something until it breaks, but as a responsibility to keep it working.`
  },
  {
    id: 'c4-06',
    level: 'cet4',
    title: 'Cities Built for Walking',
    topic: '城市 · 健康',
    source: '原创模拟 · 对齐四级',
    text: `For much of the last century, city planners treated the car as the measure of a good street. Roads were widened, crossings were removed and buildings were placed far apart, on the assumption that everyone would drive. The result was efficient for drivers and unpleasant for everyone else.

Walkable neighbourhoods reverse that priority. The test is simple: can a person reach shops, schools, parks and public transport within a short walk without crossing a motorway? When the answer is yes, daily life requires less planning and less money. A parent can let a child visit a friend; an older resident can buy food without arranging a lift.

The health effects are well documented. People who live in walkable areas tend to walk more, weigh less and report better mental health, although researchers debate how much of this is caused by the environment and how much by the kinds of people who choose to live there. What is not disputed is that walking is the easiest form of exercise to maintain, because it does not require equipment, a membership or a separate hour in the day.

Safety is the difficult part. A street becomes pleasant to walk on only when drivers expect to see people, and drivers expect to see people only when the street is already used by them. Cities that have succeeded usually began by lowering speed limits, narrowing lanes and adding trees, benches and crossings. These changes are cheap compared with building a new road, and their effects appear quickly.

Opposition often comes from shopkeepers who fear fewer parking spaces mean fewer customers. Studies in several countries have found the opposite: people on foot stop more often and spend more in total than drivers, who tend to visit a single store. The fear is understandable, but the evidence rarely supports it.

The lesson is not that cars should disappear. It is that a street serves everyone better when it is designed for the slowest and most vulnerable user first. A city that is safe for an eight-year-old to walk alone is usually comfortable for everyone else.`
  },
  {
    id: 'c4-07',
    level: 'cet4',
    title: 'Why Easy Texts Teach More',
    topic: '教育 · 语言',
    source: '原创模拟 · 对齐四级',
    text: `Language learners are often told to challenge themselves with difficult material. The advice sounds brave and sensible, and it is frequently wrong. Research on reading suggests that learners improve fastest when they understand almost everything on the page, not when they struggle through every sentence.

The key idea is known as comprehensible input. A text is useful when it is slightly beyond the learner's current level, but only slightly. If a reader recognises fewer than about ninety-eight percent of the words, attention shifts from meaning to decoding. The mind spends its energy guessing, and the pleasure of reading disappears.

This is why graded readers exist. They retell stories with controlled vocabulary, adding new words gradually and repeating them in different contexts. A learner who reads ten short books at the right level may meet the same word twenty times without trying to memorise it. That kind of repetition builds a feeling for how the word behaves, which a dictionary cannot provide.

Teachers sometimes resist the approach because it feels too easy. A class that reads a simple text seems less serious than a class that wrestles with a poem. Yet the evidence points in the other direction. Students who read extensively tend to develop larger vocabularies, better grammar and greater confidence, even when their lessons contain few formal exercises.

The approach has limits. Easy reading alone will not teach someone to write an academic essay or to follow a fast conversation. At some point the learner must be pushed, and difficulty is part of growth. The mistake is to make every task difficult, so that the learner never experiences the fluency that comes from understanding a whole text without effort.

For anyone learning a language, the practical rule is simple. Choose material that you can read for ten minutes without needing a dictionary more than once or twice. Read a lot of it. When it becomes comfortable, move up a level. Progress comes from many easy successes, not from a few heroic struggles.`
  },
  {
    id: 'c4-08',
    level: 'cet4',
    title: 'How Machines Read Medical Images',
    topic: '科技 · 医疗',
    source: '原创模拟 · 对齐四级',
    text: `Every year, hospitals produce millions of X-rays, scans and photographs of the inside of the body. A trained radiologist can read many of them in seconds, noticing a shadow that does not belong. That skill takes a decade to develop, and there are never enough specialists to meet demand.

This is why hospitals have begun testing software that examines images and flags possible problems. The systems are trained on large collections of pictures that have already been read by experts. Given a new image, the software estimates whether a suspicious area is present and sends a warning to the doctor.

The results are promising but uneven. In some studies, the software detects certain cancers earlier than a busy clinic would, particularly in screening programmes where thousands of healthy people are examined. In others, it produces a high number of false alarms, sending patients for tests they do not need. A false alarm is not harmless: it creates anxiety, costs money and can lead to procedures with their own risks.

The technology also raises a question about responsibility. If a doctor accepts a machine's suggestion and the diagnosis is wrong, who is accountable? Most hospitals answer that the doctor remains responsible, which means the software must explain its reasoning in a way a human can check. Systems that offer only a score are difficult to trust and easy to ignore.

The most likely future is not replacement but partnership. Machines are good at scanning many images quickly and at noticing patterns too subtle for the eye. People are good at understanding a patient's history, judging what matters and explaining a decision with care. A clinic that combines the two may perform better than either alone.

What should be avoided is the assumption that a new tool automatically improves care. A tool changes the way work is done, and that change must be studied. The question is not whether machines can read images. It is whether the hospital, the doctor and the patient are better off when they do.`
  },
  {
    id: 'c4-09',
    level: 'cet4',
    title: 'The Long Afternoon of a Cup of Coffee',
    topic: '健康 · 科普',
    source: '原创模拟 · 对齐四级',
    text: `Coffee is the most popular way to start a working day, and most people believe they understand its effect. They drink it, they feel more alert, and after a few hours they drink another. What few notice is how long the effect lasts and why the second cup is often unnecessary.

The active ingredient, caffeine, blocks a chemical that accumulates in the brain during waking hours and makes us feel sleepy. By occupying the receptors that would normally receive that chemical, caffeine postpones the feeling of tiredness. It does not remove the need for sleep; it hides it.

The body removes caffeine slowly. In most adults, the amount in the blood falls by half roughly every five hours, although the rate varies widely. For a person with an average metabolism, a large coffee at three in the afternoon leaves a noticeable amount in the body at midnight. That person may fall asleep without difficulty but spend less time in the deepest stage of sleep, which is the stage most important for memory.

Genetics explains part of the variation. Some people carry a version of a liver enzyme that clears caffeine quickly, while others clear it slowly and feel the effects for much longer. Age, smoking and certain medicines also change the speed. This is why two colleagues can drink the same cup and have completely different nights.

Tolerance is another factor. Regular drinkers develop more receptors for the sleep chemical, so the same dose produces a smaller effect. They may need a cup simply to feel normal, which is easily mistaken for a need to concentrate. Only after the last cup has worn off does the body begin to recover the sleep it lost.

None of this means coffee is harmful for everyone. Moderate consumption is associated with several health benefits, and for many people it is one of life's reliable pleasures. The point is to notice the timing. If sleep has become unreliable, the first experiment worth trying is not a new mattress but an earlier last cup.`
  },
  {
    id: 'c4-10',
    level: 'cet4',
    title: 'What Happens to a Shared Bike',
    topic: '环境 · 经济',
    source: '原创模拟 · 对齐四级',
    text: `When bike-sharing arrived in cities, it was presented as a simple solution to traffic and pollution. A person could unlock a bicycle with a phone, ride across town and leave it near the destination. The bicycle would then be used by someone else, and the number of cars on the road would fall.

The reality has been messier. Companies placed thousands of bicycles on pavements without asking permission, and residents soon found them blocking doors, lying in rivers and piled at the edges of parks. Some firms collapsed, leaving their bicycles behind. Cities that had welcomed the idea began to write rules.

The environmental case is also less obvious than it first appears. A shared bicycle has to be manufactured, transported, repaired and eventually recycled. If it is used only a few times a day, the energy and materials involved can outweigh the savings from the car trips it replaces. Several studies have found that the climate benefit depends heavily on how often each bike is ridden and how long it lasts.

Maintenance is the hidden cost. Bicycles left outdoors suffer from rain, theft and careless handling. A fleet that is not repaired quickly becomes a collection of broken machines that no one wants to use. Companies that invested in sturdy designs and local repair teams kept their bicycles on the road longer, while those that chased rapid growth often found their vehicles unusable within a year.

The most successful schemes have been those that treat the bicycle as part of public transport rather than as a toy. Docking stations near train lines, clear rules about parking and a price that competes with a bus ride all help. In some cities, the service is run by the transport authority, which has an interest in keeping the system reliable rather than in attracting investors.

The lesson is familiar. A technology can be useful and still fail if it is introduced without thought for the city it enters. The bicycle is not the problem; the plan is.`
  },
  {
    id: 'c4-11',
    level: 'cet4',
    title: 'The Unexpected Benefits of Volunteering',
    topic: '社会 · 心理',
    source: '原创模拟 · 对齐四级',
    text: `People usually volunteer because they want to help, and the help is real. Food is distributed, children are tutored, gardens are planted. Yet a growing body of research suggests that the person giving the time also gains something, and the gains are not merely a pleasant side effect.

Studies that follow volunteers over several years report lower rates of depression, greater satisfaction with life and, in some cases, better physical health. The effects are strongest among older adults, for whom volunteering provides structure and regular contact with others. A weekly shift at a charity shop may do more for wellbeing than a subscription to a gym.

The reasons are not mysterious. Volunteering creates a sense of purpose, which is difficult to buy. It places a person in a group with a shared task, which makes conversation easier than at a party. And it offers evidence that one's actions matter, a feeling that is often missing from work that is measured only by output.

There is a risk of overstating the benefit. Volunteering cannot replace a living wage, and asking people who are struggling to give their time for free can be a way of avoiding the harder question of pay. Nor is every placement suitable: a task that feels pointless or badly organised can leave a volunteer more tired than fulfilled.

The design of the work matters. Volunteers do best when they understand why their task matters, when they receive some training and when their hours are predictable. Organisations that treat volunteers as unpaid staff, without support or recognition, tend to lose them quickly.

For anyone considering it, the practical advice is to start small and choose something that uses a skill you already have. A person who enjoys cooking can help in a kitchen; someone who is patient with numbers can assist with paperwork. The point is not to become a better person through effort. It is to join a group of people doing something useful, and to discover that the work gives back more than expected.`
  },
  {
    id: 'c4-12',
    level: 'cet4',
    title: 'Paper, Screens and the Memory of Reading',
    topic: '教育 · 认知',
    source: '原创模拟 · 对齐四级',
    text: `For centuries, reading meant paper. Today, most of the words a student meets arrive on a screen, and the change is often described as neutral: a text is a text. Research on reading suggests that this is not quite true.

Several studies have found that people remember more of a text when they read it on paper than when they read the same text on a screen. The difference is small and does not appear for every kind of material, but it is consistent enough to matter. One explanation is physical. A paper book offers landmarks: the left page, the thickness of the unread part, the position of a paragraph near the bottom. These cues help the mind build a map of the text, and the map supports memory.

Screens offer different cues. A page that scrolls has no fixed edges, and a notification can interrupt at any moment. Even when a reader ignores a message, the awareness that it might arrive uses attention. Studies of students reading online report more scanning and less sustained concentration, not because the students are lazy but because the medium invites a different behaviour.

This does not mean that screens are bad for learning. Digital texts are searchable, portable and cheap, and for many purposes they are clearly superior. A student comparing five sources will work faster on a computer than with a pile of books. The problem arises when the same habits are applied to material that requires patience.

The practical solution is to match the medium to the task. Complicated arguments, long novels and material that must be remembered are often better on paper. Short articles, reference material and anything that needs to be searched are well served by a screen. Where paper is unavailable, simple changes help: turn off notifications, use a paged reader rather than an endless scroll, and take notes by hand.

The deeper lesson is that reading is not a single skill. It is a set of habits, and the tools we use shape those habits. Choosing a medium deliberately is part of learning to read well.`
  },
  {
    id: 'c6-01',
    level: 'cet6',
    title: 'The Attention Economy and Its Real Cost',
    topic: '媒体 · 心理',
    source: '原创模拟 · 对齐六级',
    text: `The phrase attention economy is used so loosely that it has begun to lose its meaning. It is invoked to explain everything from shrinking concentration to the tone of political argument. The term remains useful, but only if we are precise about what is scarce, who is buying it and what is actually being sold.

In an attention economy, information is abundant and the capacity to attend to it is not. That asymmetry gives platforms a strong incentive to capture as much of that capacity as possible and to convert it into measurable engagement. The metric matters because what cannot be counted cannot be sold, and what is counted tends to become the goal. A system that measures minutes watched will optimise for minutes, whether or not the viewer remembers anything afterwards.

The consequences are subtler than the familiar complaint that young people no longer read. What changes is not merely the quantity of attention but its form. Content that produces an immediate reaction is rewarded, because immediate reactions are easy to record. Content that requires patience before it yields a reward is structurally disadvantaged, however valuable it may be. A poem, a proof and a careful argument all ask for time before they give anything back, and time is precisely what the system is designed to interrupt.

The second consequence is habituation. A reader who spends hours each day in an environment engineered to interrupt gradually acquires habits suited to that environment: rapid scanning, low tolerance for ambiguity, a preference for conclusions over reasoning. These habits are not irrational. They are efficient adaptations to the place where the reader spends most of their waking life.

It would be comforting to treat this as a matter of discipline. But when an entire environment is designed to reward one behaviour, individual willpower is a fragile defence, and blaming individuals is a way of avoiding the question of design. The more promising responses are structural: devices that do not notify by default, public spaces where phones are not expected, and norms that do not treat an unanswered message as an insult.

None of this requires rejecting technology. It requires treating attention as a resource that deserves the kind of protection we once gave to clean water: not because individuals are incapable of good choices, but because some costs are too widely shared and too slowly felt to be managed by choice alone.`
  },
  {
    id: 'c6-02',
    level: 'cet6',
    title: 'Designing Cities for a Hotter Century',
    topic: '环境 · 城市',
    source: '原创模拟 · 对齐六级',
    text: `Urban heat is often described as a comfort problem, which is a serious understatement. In a growing number of cities, extreme heat is a public health emergency, a strain on electricity networks and a cause of measurable economic loss. The question is no longer whether cities will need to adapt, but whether they will adapt in ways that protect everyone.

The physics is straightforward. Concrete and asphalt absorb solar radiation during the day and release it slowly at night, so dense districts can remain several degrees warmer than the surrounding countryside. Air conditioning removes heat from buildings but deposits it in the street, and the electricity it demands peaks at exactly the moment when the grid is most fragile. A technology that provides private relief can therefore worsen the public problem it is meant to solve.

Adaptation strategies are well known. Trees, reflective surfaces, shaded walkways, permeable pavements and buildings designed to allow air to move all reduce heat. What is less often acknowledged is that these measures are distributed unevenly. Wealthier neighbourhoods tend to have more trees and better-insulated homes, while lower-income districts, often built near industry or major roads, have less shade and less capacity to pay for cooling. A city can lower its average temperature while leaving its most vulnerable residents exposed.

There is also a risk of maladaptation. A new air-conditioned mall may offer relief to those who can reach it, but it does nothing for the elderly resident who cannot leave home. A policy that measures success by average temperature may reward projects that improve the experience of the comfortable. Insurance markets are beginning to register the same pattern: premiums rise in exposed areas, pushing those who can least afford it toward housing that is even more vulnerable.

The most credible plans treat heat as an infrastructure problem rather than an emergency. That means mapping which streets are hottest, identifying who lives there, and funding shade and insulation where the risk is greatest. It also means revising building codes so that new developments do not create heat traps for the next fifty years.

None of this is cheap, and the benefits are easy to postpone because they appear as disasters that did not happen. That is the familiar difficulty of preventive policy. The cities that manage it will be those that can persuade voters to pay now for comfort, health and lives that would otherwise be lost in a summer that has not yet arrived.`
  },
  {
    id: 'c6-03',
    level: 'cet6',
    title: 'The Transparency Paradox',
    topic: '科技 · 伦理',
    source: '原创模拟 · 对齐六级',
    text: `Few demands in technology policy are as widely endorsed as transparency. If an algorithm influences what we see, who receives a loan or how long a sentence someone serves, the reasoning goes, the public has a right to know how it works. The demand is reasonable, and it is more complicated than it appears.

The first complication is technical. Modern machine-learning systems are not transparent in any ordinary sense. Their behaviour emerges from millions of numerical adjustments, and even their designers cannot always explain why a particular input produced a particular output. Requiring that such systems publish their source code may reveal very little, while exposing information that competitors and bad actors can exploit. It may also conflict with trade secrets and with data-protection rules, since the code can encode details about the people whose behaviour it was trained on.

The second complication is behavioural. When people know the criteria by which they are judged, they adapt. Universities that publish a ranking formula soon receive applications shaped to fit it; sellers who learn how a search engine orders results optimise for the algorithm rather than for the customer. Transparency can therefore improve accountability and, at the same time, make the measure less meaningful.

This is the paradox. A system that is fully visible can be gamed, while a system that is opaque cannot be challenged. Neither extreme serves the public. What is needed is a form of transparency that is selective: enough information for independent experts to audit the system, but not so much that every decision becomes a target for manipulation.

Such a design is possible. Regulators can require access for accredited auditors, publish aggregate statistics about errors and disparities, and demand explanations aimed at the person affected rather than at the general public. A rejected applicant needs to know which factors mattered and how to challenge them; the public needs to know whether the system is accurate and fair. These are different questions, and they require different answers.

The deeper issue is legitimacy. People accept decisions they consider fair even when the outcome disappoints them, provided the process is intelligible and open to appeal. Transparency is valuable not because it produces perfect knowledge, but because it supports the belief that power can be examined. A policy that treats transparency as a ritual of disclosure, rather than as a means of accountability, may satisfy the letter of the demand while leaving the substance untouched.`
  },
  {
    id: 'c6-04',
    level: 'cet6',
    title: 'The Care Economy Nobody Prices',
    topic: '社会 · 经济',
    source: '原创模拟 · 对齐六级',
    text: `Every economy depends on work that is never counted. Children are raised, elderly parents are helped to eat, sick neighbours are driven to appointments and households are kept habitable. Because this work is usually performed by women, at home, without a wage, it appears in national accounts as nothing at all.

The omission is not a minor statistical detail. It shapes how governments think about growth, how employers think about labour and how families decide who will sacrifice a career. If care is invisible, it is easy to assume that it is free, and if it is free, there is little reason to invest in it.

The arithmetic is becoming harder to ignore. Populations are ageing, and the number of older people needing support is rising faster than the number of working-age adults available to provide it. At the same time, more women are in paid employment, which reduces the supply of unpaid carers. The gap is filled by a mixture of family sacrifice, underpaid domestic workers and institutions that are often short of staff.

The consequences fall disproportionately on those with the least bargaining power. A woman who leaves employment to care for a parent loses income, pension contributions and the chance to advance. A migrant worker who provides care in another country may leave her own children in the care of relatives. These arrangements are individually rational and collectively costly, since they reproduce the inequality they are meant to manage.

Economists have proposed ways to make care visible. Time-use surveys can estimate the hours involved; satellite accounts can assign them a value without pretending they are identical to market services. Such measures do not solve the problem, but they change the terms of debate. A government that can see the size of the care economy is more likely to treat childcare, eldercare and paid leave as infrastructure rather than as private troubles.

Some countries have gone further, funding universal childcare, statutory leave for both parents and cash allowances for family carers. The results are mixed, and the costs are real, but the direction is consistent: care becomes a public responsibility rather than a private risk. The moral case is straightforward, yet the political case may be stronger. Societies that neglect care eventually face labour shortages, lower birth rates and higher health costs. Recognising care as work is not merely a matter of justice. It is a condition for the economy that the accounts currently fail to describe.`
  },
  {
    id: 'c6-05',
    level: 'cet6',
    title: 'Why Science News Distorts Science',
    topic: '科学 · 传播',
    source: '原创模拟 · 对齐六级',
    text: `A single study reports that people who drink coffee live slightly longer. Within hours, headlines announce that coffee prolongs life. A week later, another study finds no such effect, and the public concludes that scientists cannot make up their minds.

The distortion happens in a series of small, well-intentioned steps. Researchers, competing for funding and attention, are encouraged to state their findings in the most striking terms their data will permit. University press offices, seeking coverage, translate cautious language into memorable claims. Journalists, working to deadlines, prefer the version that fits a headline. None of these actors is lying, yet the final product may bear little resemblance to the original.

The underlying problem is statistical. Many published findings rest on samples small enough that an apparent effect could easily have arisen by chance. When thirty teams investigate the same question, the one that finds a striking result is more likely to be published, while the twenty-nine that find nothing remain in a drawer. A reader who encounters only the published result receives a systematically misleading picture, not because any single paper is fraudulent but because the visible literature is a biased sample.

The speed of online publishing makes the problem worse. Preprints appear before peer review, and a preliminary result can circulate for months before anyone checks it. Social media rewards the most surprising claim, so a correction, which is usually quieter and later, rarely reaches the same audience. The reader is left with a vivid first impression and a vague sense that something was later disputed.

Some journalists have responded by reporting uncertainty explicitly: giving the size of an effect rather than its direction alone, distinguishing correlation from causation and asking whether a result has been replicated. This is less satisfying to read and travels poorly on social media, which rewards certainty.

The deeper issue concerns what readers expect from science. If science is understood as a collection of settled facts, every contradiction looks like failure. If it is understood as a method for reducing uncertainty, a study that overturns an earlier result is not a scandal but the system working as intended. The difficulty is that the second understanding is harder to communicate and less useful in a headline.

Improving the situation requires changes at several points: incentives for researchers to publish null results, press offices willing to accept a quieter story and readers prepared to tolerate ambiguity. None of these is likely on its own. Together they suggest that the problem is not a lack of honesty but a structure that rewards confident simplification at every stage.`
  },
  {
    id: 'c6-06',
    level: 'cet6',
    title: 'The Identity Work of Gig Work',
    topic: '经济 · 社会',
    source: '原创模拟 · 对齐六级',
    text: `Discussions of gig work usually focus on pay and flexibility. Supporters point out that a driver can choose when to work; critics reply that the choice is illusory when income depends on accepting every offer. Both sides are describing the same arrangement from different angles, and both tend to overlook a third dimension: the effect on how workers understand themselves.

A conventional job provides more than a wage. It supplies a title, a set of colleagues, a daily rhythm and a story about what one does. These elements are not decorative. They help people answer the question of who they are, and they make it easier to explain that answer to others.

Platform work dissolves much of this structure. The worker is classified as an independent contractor, evaluated by ratings and managed by software that assigns tasks without conversation. The arrangement offers freedom from a supervisor and, at the same time, removes the relationships through which a career is built. A driver may work for years without a colleague who knows their name.

The rating system deserves particular attention. A score that summarises thousands of interactions appears objective, yet it is produced by customers who may be tired, impatient or simply unfair. Workers learn to perform friendliness and to avoid any exchange that might be judged poorly. The performance is genuine in its effects, even when the feeling behind it is not, and the constant monitoring can make the work feel more controlled than a factory shift.

The psychological consequences are not uniform. Some workers value the absence of office politics and the ability to combine platform work with study or care responsibilities. Others describe a persistent uncertainty that goes beyond income: a sense that they are always available and never established. The difference often depends on whether the work is a supplement or a necessity.

Collective responses are emerging, though slowly. Traditional unions were designed for employees with a single employer, and platform workers occupy a legal category that fits neither employment nor self-employment. Some countries have created intermediate statuses with partial rights; others have relied on litigation. Each approach has costs, and none has resolved the tension between flexibility and security.

The policy question is therefore not simply how to raise pay. It is how to provide the stability that makes a working life intelligible without destroying the flexibility that makes the work attractive. That requires institutions willing to experiment, and a public conversation that treats identity not as a private matter but as part of what decent work provides.`
  },
  {
    id: 'c6-07',
    level: 'cet6',
    title: 'Can Markets Save Biodiversity?',
    topic: '生态 · 经济',
    source: '原创模拟 · 对齐六级',
    text: `Biodiversity credits are an appealing idea. A developer whose project destroys a wetland pays for the restoration of an equivalent habitat elsewhere; a company that wishes to claim a positive impact buys units representing protected species or restored forest. In theory, the market directs money toward nature and allows growth to proceed without net loss.

In practice, the market rests on assumptions that are difficult to verify. The first is measurement. A hectare of forest is not equivalent to another hectare, and the value of a habitat depends on species, connectivity, age and the services it provides. Reducing this complexity to a single unit risks creating a currency that looks precise and means very little.

The second assumption is additionality: the restoration must not have happened anyway. If a company pays for the protection of land that was already protected, the payment changes nothing except the accounts. Demonstrating what would have occurred in the absence of a project is inherently speculative, and the incentive to overstate the counterfactual is strong.

The third is permanence. Forests burn, regulations change and projects that promised to last a century may be abandoned in a decade. A credit sold today may represent a benefit that disappears before the buyer's claim has expired.

Better monitoring can reduce these risks. Satellites can track changes in land cover, environmental DNA can reveal which species are present, and long-term contracts can tie payments to verified outcomes rather than to promises. Such systems are costly and still cannot resolve how to compare one habitat with another. But they make cheating harder and progress measurable.

These problems are not arguments for abandoning the idea. They are arguments for regulation. Markets can work when the rules are strict and the monitoring is independent. Wetland mitigation in some countries now requires long-term financial guarantees and regular inspection, which reduces the risk of failure even if it raises the cost.

The more fundamental question is what such markets are for. Not only does a payment fail to restore the habitat; it may also allow the damage to continue under a greener label. If credits exist mainly to make destructive projects acceptable, they may accelerate the loss they claim to offset. If they exist to channel additional money toward nature, they can be valuable, provided the money is genuinely additional and the outcomes are measured honestly.

The distinction matters because the language of net gain can be soothing. A number that balances on a spreadsheet is not the same as an ecosystem that continues to function. Markets are useful tools, but they are not a substitute for the political decision to protect what cannot be priced.`
  },
  {
    id: 'c6-08',
    level: 'cet6',
    title: 'The Neural Cost of Constant Switching',
    topic: '认知 · 工作',
    source: '原创模拟 · 对齐六级',
    text: `Modern work is organised around interruption. A message arrives, a meeting begins, a document is opened and abandoned. Most people describe this as busy. Research on attention suggests that it is better described as expensive.

When a person switches from one task to another, part of the mind remains attached to the task that was left behind. This residue, sometimes called attention residue, makes it harder to concentrate fully on the new activity. The effect is small for a single switch and substantial when switches occur every few minutes. Over a working day, the accumulated cost can exceed the time saved by handling messages immediately.

The residue is difficult to measure, which is one reason it is easy to ignore. People report how long they spent on a task but not how much of their attention was still elsewhere. They also tend to underestimate the time needed to return to a complex problem, because the return feels instantaneous even when the quality of thought is lower. A worker who answers a message in thirty seconds may lose ten minutes of effective concentration without noticing.

The problem is not merely technological. Organisations reward responsiveness, and responsiveness requires interruption. A worker who replies within minutes is considered reliable; one who waits an hour may be considered distant, even if the delay allows deeper work. The norms of a workplace therefore determine whether concentration is possible, and individual strategies can only do so much against a culture that treats availability as a virtue.

There is also a subtler cost. Difficult problems require a period of confusion before they yield, and the confusion is uncomfortable. An interruption offers relief from that discomfort, which is why we often welcome it. The result is a preference for tasks that provide immediate feedback over tasks that matter but resist quick progress. Over time, the habit can narrow the range of work a person is willing to attempt.

Some organisations have responded with protected time: mornings without meetings, communication tools that deliver messages in batches and expectations that replies need not be instant. The evidence from these experiments is encouraging but not uniform. Success depends on whether senior staff respect the rules, since a single manager who ignores them can restore the old pattern.

The broader lesson concerns design rather than discipline. Attention is shaped by the environment in which work takes place, and expecting individuals to defend their concentration against a system that rewards interruption is unrealistic. A serious response requires changing the system: fewer meetings, clearer priorities and a shared understanding that not every message deserves an immediate answer.`
  },
  {
    id: 'c6-09',
    level: 'cet6',
    title: 'Who Owns Cultural Memory?',
    topic: '文化 · 技术',
    source: '原创模拟 · 对齐六级',
    text: `Digitisation was once presented as a solution to loss. Manuscripts that crumble, recordings that degrade and photographs that fade could all be preserved as perfect copies, available to anyone with a connection. The promise was democratic and, in important respects, it has been kept.

Yet the digital archive has created problems of its own. The first is control. A museum that places its collection online may retain ownership of the images while granting access through a platform whose terms can change. Researchers who once travelled to consult an object may now depend on a licence, and the terms of that licence may forbid the very uses that scholarship requires.

The second is context. An object removed from its setting loses part of its meaning. A mask displayed in a glass case is already displaced. Stripped of scale, material and the sound of the ceremony in which it was used, a digital photograph of the mask is displaced again. Metadata can restore some of this information, but only if someone decides that it matters and has the authority to describe it.

The third is the question of ownership itself. Many collections were assembled during periods of colonial rule, and the demand for repatriation has grown louder. Digital copies complicate the debate: a museum may argue that it preserves and shares the object, while a community may reply that sharing an image is not the same as controlling a heritage. The technology that promised access has also made it possible to postpone return indefinitely.

Preservation has a further irony. Digital files are not permanent. Formats become unreadable, storage media fail and institutions that can afford to create an archive may not be able to maintain it. The very abundance of copies can create a false confidence, since a file that exists in a thousand places may still be lost if no one is responsible for migrating it.

None of these problems has an easy solution. What they share is a recognition that preservation is not a neutral act. To digitise something is to make choices about what to keep, how to describe it and who may see it. Those choices reflect power, and they are rarely documented as carefully as the objects themselves.

A more honest approach would treat archives as partnerships. Communities of origin could be involved in decisions about description and access; licences could distinguish between commercial use and study; and institutions could publish the history of how their collections were acquired. Such measures will not settle every dispute, but they would make visible the interests that the language of preservation tends to hide.`
  },
  {
    id: 'c6-10',
    level: 'cet6',
    title: 'Automation and the Skills That Remain',
    topic: '科技 · 经济',
    source: '原创模拟 · 对齐六级',
    text: `Predictions about automation usually divide into two camps. One imagines mass unemployment as machines replace human workers; the other insists that new technologies have always created more jobs than they destroyed. Both positions contain truth, and both obscure the more interesting question: which tasks will remain human, and why.

The answer depends less on the difficulty of a task than on its composition. A job is rarely a single activity. A radiologist reads images, consults colleagues, explains results to anxious patients and decides when further tests are justified. A machine may perform the first activity well while remaining useless at the others. The job changes rather than disappears, and the change alters the skills that matter.

Detailed studies of occupations support this view. They find that automation typically replaces particular tasks rather than whole professions, and that the effect on employment depends on how quickly workers can move into the tasks that remain. A bank that installs cash machines may employ fewer tellers, but it may also employ more staff to sell products and advise customers, provided those staff have the right training.

This pattern favours workers whose abilities complement machines rather than compete with them. Someone who can interpret an algorithm's output, recognise its limits and communicate a judgement to a patient becomes more valuable, not less. Someone whose work consists of a repetitive procedure with a clear rule is more exposed. The distinction is not between manual and cognitive labour, since many cognitive tasks are routine and many manual tasks require judgement.

The distributional consequences are serious. Workers who can acquire complementary skills capture a growing share of the gains, while those whose tasks are automated face falling wages and unstable employment. Training programmes often promise to close the gap, but the evidence for their effectiveness is mixed. Short courses rarely substitute for the years of education and practice that build expertise.

Institutions matter more than forecasts. Countries with strong vocational systems, portable benefits and employers willing to invest in their staff adapt more smoothly than those that treat training as an individual responsibility. The difference is not technological but political: it reflects decisions about who bears the risk of change.

The likely future is therefore neither a world without work nor one in which everyone thrives. It is a labour market in which the value of judgement, communication and the ability to work with imperfect information rises, and in which access to those skills is unevenly distributed. The question is not what machines can do, but who will be helped to do what machines cannot.`
  },
  {
    id: 'c6-11',
    level: 'cet6',
    title: 'The Fragile Currency of Public Trust',
    topic: '社会 · 健康',
    source: '原创模拟 · 对齐六级',
    text: `Public health depends on trust. A vaccine that is available but refused protects no one; a warning that is ignored is indistinguishable from silence. Yet trust is difficult to build, easy to lose and often misunderstood by the institutions that need it most.

One misunderstanding is that trust is primarily a matter of information. If people distrust a recommendation, the reasoning goes, they must lack the facts, and the solution is to supply more of them. This assumption fails when the distrust is rooted in experience. A community that has been neglected by health services, or harmed by past experiments, has reasons for caution that no leaflet can erase.

A second misunderstanding is that trust is uniform. People trust different institutions for different purposes. A patient may trust a family doctor while distrusting a government ministry; a parent may accept advice about nutrition while rejecting advice about schooling. Surveys that ask whether people trust science in general therefore conceal more than they reveal.

Trust is also easier to destroy than to repair. A single scandal can undo years of patient work, and the damage spreads to institutions that were not involved. This asymmetry creates a strong incentive for transparency, but transparency is not enough. Institutions must also be willing to admit error, which conflicts with the instinct to protect reputation.

Polarisation makes the problem harder still. When a health recommendation becomes a symbol of political identity, the facts about it matter less than the group that supports it. Messages designed for the general public may then be heard as attacks on a way of life, and the most trusted voice may be someone who shares the audience's suspicions rather than someone with expert knowledge.

The most effective responses tend to be local. A trusted nurse who answers questions in a community centre may achieve more than a national campaign, because the nurse can respond to the specific worry behind the general doubt. Engagement of this kind is slow, difficult to measure and rarely photogenic, which is why it is often underfunded.

None of this suggests that facts do not matter. They do, and institutions have an obligation to communicate them clearly. But facts become persuasive only when the messenger is believed, and belief is built through relationships rather than announcements. A society that wants trustworthy institutions must be willing to fund the unglamorous work of earning trust, and to accept that the work cannot be replaced by a better slogan.`
  },
  {
    id: 'c6-12',
    level: 'cet6',
    title: 'The Vanishing Third Place',
    topic: '城市 · 社会',
    source: '原创模拟 · 对齐六级',
    text: `Sociologists use the term third place to describe settings that are neither home nor work: cafes, barbershops, libraries, parks, places where people encounter one another without a specific purpose. These settings are unremarkable individually and important collectively, because they provide the loose ties from which community is built.

The third place is disappearing in many cities, and the reasons are partly economic. Rising rents make it difficult for a small cafe or a community hall to survive, and the spaces that remain are often designed for consumption rather than lingering. A person who buys nothing may feel unwelcome, which excludes exactly those who most need a place to sit.

Online life is not a substitute. A group chat can maintain an existing friendship, but it rarely creates the accidental acquaintance that a shared table produces. Technology has changed the pattern as well. Remote work removes the daily journey that once produced casual encounters, and delivery services reduce the errands that brought neighbours into contact. Each convenience is genuine, and together they reduce the number of occasions on which strangers become familiar.

The loss is difficult to measure because its benefits are indirect. A conversation at a bus stop is not an economic transaction, yet the willingness to trust strangers, which such encounters cultivate, supports everything from local politics to disaster response. Studies of neighbourhoods repeatedly find that informal contact predicts cooperation better than formal programmes.

Some cities have begun to treat third places as infrastructure. Libraries have extended their opening hours and added meeting rooms; parks have installed benches and lighting; zoning rules have been revised to allow small businesses in residential areas. These measures are modest, and their effects accumulate slowly. The most successful projects are often the least ambitious: a few tables outside a shop, a room that can be booked for free, a notice board that tells people what is happening nearby.

The deeper challenge is cultural. A society that values efficiency above all else will produce fewer places that serve no obvious purpose, and it will find it harder to explain why they matter. Defending them requires an argument that is difficult to make in a budget meeting: that a city is not only a machine for production but a place where people live together, and that living together requires somewhere to do it. A bench costs almost nothing, yet it may be the cheapest piece of social infrastructure a city can install.`
  }
]

function levelLabel(key) {
  const hit = LEVELS.find((item) => item.key === key)
  return hit ? hit.label : '四级'
}

function countWords(text) {
  return (String(text).match(/[A-Za-z']+/g) || []).length
}

// 列表页只需要摘要，别把整篇文章都塞进 setData
function listOf(level) {
  return ARTICLES
    .filter((item) => !level || item.level === level)
    .map((item) => ({
      id: item.id,
      level: item.level,
      levelLabel: levelLabel(item.level),
      title: item.title,
      topic: item.topic,
      source: item.source,
      kind: 'mock',
      issueLabel: levelLabel(item.level) + '模拟篇',
      words: countWords(item.text)
    }))
}

function findByLevel(level, excludeId) {
  const pool = ARTICLES.filter((item) => item.level === level && item.id !== excludeId)
  const list = pool.length ? pool : ARTICLES.filter((item) => item.id !== excludeId)
  if (!list.length) return ARTICLES[0]
  return list[Math.floor(Math.random() * list.length)]
}

function findById(id) {
  return ARTICLES.find((item) => item.id === id) || null
}

// 出处标签：真题显示「2023年6月 · 第2套 · Passage 1」，内置文章显示「四级模拟篇」
function issueLabel(article) {
  if (!article) return ''
  if (article.kind === 'mock') return `${levelLabel(article.level)}模拟篇`
  // 归档归属优先：只有真题才展示年份出处，普通导入填了年份也不冒充真题
  if (article.kind === 'real' || (!article.kind && article.year)) {
    if (!article.year) return '真题'
    const parts = [`${article.year}年${article.month ? `${article.month}月` : ''}`]
    if (article.paper) parts.push(`第${article.paper}套`)
    if (article.passage) parts.push(`Passage ${article.passage}`)
    return parts.join(' · ')
  }
  return '其它篇目'
}

module.exports = { LEVELS, ARTICLES, listOf, findByLevel, findById, countWords, levelLabel, issueLabel }
