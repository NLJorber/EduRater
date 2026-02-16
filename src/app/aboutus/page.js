// app/about/page.tsx
"use client";

import Image from "next/image"; 

export default function AboutPage() {
  return (
    <main className="display-headings bg-brand-blue m-0 text-brand-cream min-h-[calc(100vh-5rem)]">
      <div className="w-full max-w-3xl mx-auto pt-32">
      <h1 className="font-bold pl-3">''Hey there,</h1>



          <h4 className="mt-6 px-10"> thank you for coming to find out more. We are three people who created Edurater because of our shared experiences. We know what it's like to seek out the best routes for ourselves and our children, while feeling like some of the vital knowledge is hard to access at open days or during official events.</h4>

          <div className="border rounded-md border-brand-cream mt-10 py-3 bg-brand-cream/20 text-center">
          <h3 className="text-brand-orange text-shadow-dark px-10">Edurater exists to fill that gap.
          </h3>
          </div>

      <h4 className="px-10 pt-10">We know the importance of finding the right place, and the difficulty of finding good, on-the-ground community information about the options available.</h4>

 <blockquote className="border-l-4 border-brand-orange pl-16 italic text-brand-cream/80  my-12">
      <h4 className="mt-6 font-medium">We seek to uncover hidden gems, to foster a sharing environment where the real experiences of children and parents are freely available to read about to add to the all-important search for the best fit for a place that our children will spend so much of their lives in.</h4>
      </blockquote>

      <h4 className="mt-8 px-10">Education is with us for life. We are all touched by educational establishments, and we often go on to have children whose educational needs we have to make decisions about.</h4>

      <blockquote className="border-l-4 border-brand-orange pl-16 italic text-brand-cream/80  my-12">
      <h4 className="mt-6 font-medium">Inspections are invaluable, but a school is much more than a snapshot of a day or a week. Our vision is for a community led space where openness can drive excellence.''</h4>
      </blockquote>


      <h5 className="text-brand-orange text-shadow-dark mt-6 px-5 text-center pb-10">If you have suggestions or would like to see a feature we don't currently have,<br></br> please contact us!</h5>

    <div className="flex items-center justify-center pb-10">
    <Image
                src="/EduRaterLogo.png"
                alt="Edurater logo"
                width={70}
                height={70}
                className="rounded-full"
                priority
              />
</div>
      </div>
    </main>
  );
}
