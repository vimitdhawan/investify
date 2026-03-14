import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const testimonials = [
  {
    name: 'Jane Doe',
    title: 'CEO, Local Cafe',
    quote:
      "SaarthiFlow transformed our booking system. It's intuitive, efficient, and our customers love the seamless experience.",
  },
  {
    name: 'John Smith',
    title: 'Owner, Fitness Studio',
    quote:
      'Inventory management used to be a nightmare. With SaarthiFlow, we track everything in real-time and never run out of stock.',
  },
  {
    name: 'Emily White',
    title: 'Manager, Beauty Salon',
    quote:
      'The analytics dashboard is a game-changer. We can now make data-driven decisions that truly impact our revenue.',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="border-t px-4">
      <div className="container max-w-screen-2xl flex flex-col items-center gap-8 py-24 text-center md:py-32">
        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
          What Our Customers Say
        </h2>
        <p className="text-muted-foreground sm:text-lg max-w-3xl mx-auto">
          Hear directly from businesses that have revolutionized their operations with SaarthiFlow.
        </p>
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle>{testimonial.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{testimonial.title}</p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground italic">{testimonial.quote}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
