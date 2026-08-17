<script lang="ts">
  // FloatingQuestions.svelte
  // Decorative background: rows of chat-bubble interview-question fragments
  // scrolling in alternating directions. Purely visual — no interactivity.

  type Row = {
    fragments: string[]
    rtl: boolean
    duration: number
    delay: number
    colorClass: string
  }

  const allFragments: string[] = [
    'Tell me about a time when…',
    'Tell me about your leadership style…',
    'Have you ever had to…',
    "What's your approach to…",
    'How do you handle conflict on a team?',
    'Walk me through a tough decision…',
    'Describe a situation where you failed…',
    "What was the hardest problem you've solved?",
    'Why did you decide to leave?',
    'How would you rebuild it today?',
    "What's a lesson you learned from…",
    'Tell me about a decision you regret…',
    'When have you had to influence without authority?',
    'What does a great product look like to you?',
    'How do you balance speed and quality?',
    'Where do you see yourself in five years?',
    "What's your hot take on AI in engineering?",
    'Tell me about a time you disagreed with your manager…',
    'How did you grow from that experience?',
    'Describe your ideal team culture…',
    'What motivates you beyond compensation?',
    'How do you prioritize when everything is urgent?',
    'Tell me about a time you had to earn trust quickly…',
    "What's the most complex system you've designed?",
    'How do you stay current in a fast-moving field?',
    'Tell me about a product launch that surprised you…',
    'What would your coworkers say about you?',
    'How do you approach giving difficult feedback?',
    'Describe a time you had to pivot your strategy…',
    'What does success look like to you in this role?',
  ]

  // Distribute fragments across 4 rows (3 on mobile). Each row pulls a distinct
  // slice from the pool so bands show different text. ~7 bubbles per row gives
  // the doubled strip enough width to exceed ~2× viewport for seamless looping.
  // Negative animation-delay makes each row start mid-cycle, so bubbles
  // never line up at the same horizontal point on first render.
  const rows: Row[] = [
    {
      fragments: allFragments.slice(0, 7),
      rtl: false,
      duration: 70,
      delay: 15,
      colorClass: 'chat-bubble-primary',
    },
    {
      fragments: allFragments.slice(7, 14),
      rtl: true,
      duration: 85,
      delay: 42,
      colorClass: 'chat-bubble-secondary',
    },
    {
      fragments: allFragments.slice(14, 21),
      rtl: false,
      duration: 100,
      delay: 28,
      colorClass: 'chat-bubble-accent',
    },
    {
      fragments: allFragments.slice(21, 28),
      rtl: true,
      duration: 80,
      delay: 58,
      colorClass: 'chat-bubble',
    },
  ]
</script>

<!-- Decorative background — entirely hidden from assistive tech.
     Rows are distributed evenly across the full viewport height. -->
<div
  class="pointer-events-none absolute inset-0 flex flex-col justify-around overflow-hidden opacity-[0.12]"
  aria-hidden="true"
>
  {#each rows as row, i}
    <div
      class="flex items-center"
      class:hidden={i >= 3}
      class:sm:flex={i >= 3}
    >
      <!--
        Seamless loop: render the fragment list twice inside a single strip,
        then animate translateX from 0 → -50% (LTR) or -50% → 0 (RTL).
        The strip is always at least 2× the content width so no gap is visible.
      -->
      <div
        class="flex shrink-0 gap-10 whitespace-nowrap sm:gap-14"
        class:animate-scroll-ltr={!row.rtl}
        class:animate-scroll-rtl={row.rtl}
        style="animation-duration: {row.duration}s; animation-delay: -{row.delay}s;"
      >
        <!-- First copy -->
        {#each row.fragments as fragment}
          <div class="chat-bubble {row.colorClass} shrink-0 text-sm sm:text-base">
            {fragment}
          </div>
        {/each}
        <!-- Second copy — identical, creates the seamless loop -->
        {#each row.fragments as fragment}
          <div class="chat-bubble {row.colorClass} shrink-0 text-sm sm:text-base">
            {fragment}
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  /* LTR: content moves right-to-left — start at 0, end at -50% */
  @keyframes scroll-ltr {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }

  /* RTL: content moves left-to-right — start at -50%, end at 0 */
  @keyframes scroll-rtl {
    from {
      transform: translateX(-50%);
    }
    to {
      transform: translateX(0);
    }
  }

  .animate-scroll-ltr {
    animation-name: scroll-ltr;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    /* duration set inline via style attribute */
  }

  .animate-scroll-rtl {
    animation-name: scroll-rtl;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }

  /* Honor reduced-motion preference — pause all animations */
  @media (prefers-reduced-motion: reduce) {
    .animate-scroll-ltr,
    .animate-scroll-rtl {
      animation-play-state: paused;
    }
  }
</style>
