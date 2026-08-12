import { panels } from '../data'
import { isDelayed, wordReveal, type StripView } from '../model/reveal'
import { PanelWords, type RegisterWord } from './PanelWords'
import { StripPanel } from './StripPanel'

/**
 * The words, revealing by distance from the middle of the pinned viewport.
 * Placement is panel-relative, so only the *timing* needs strip coordinates.
 */
export function WordsLayer({
  view,
  registerWord,
}: {
  view: StripView
  registerWord: RegisterWord
}) {
  const panelHeight = `${view.viewportH}px`

  return (
    <>
      {panels.map((panel, i) => {
        const panelTop = (i + 1) * view.viewportH // the intro holds slot 0

        return (
          <StripPanel key={panel.id} index={i + 1} panelHeight={panelHeight}>
            <PanelWords
              panel={panel}
              register={registerWord}
              opacityOf={(yPercent, wordId) =>
                wordReveal(panelTop + (yPercent / 100) * view.viewportH, view, isDelayed(wordId))
              }
            />
          </StripPanel>
        )
      })}
    </>
  )
}
