package com.proyecto.atlas.fragment

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.annotation.StringRes
import androidx.fragment.app.Fragment
import com.proyecto.atlas.databinding.FragmentPlaceholderBinding

/**
 * Pantalla provisional para las pestañas que se construyen en los Prompts 4 y 5.
 * Cada pestaña solo aporta su título; el layout es compartido.
 */
abstract class PlaceholderFragment : Fragment() {

    @get:StringRes
    protected abstract val titleRes: Int

    private var _binding: FragmentPlaceholderBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentPlaceholderBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding.tvPlaceholderTitle.setText(titleRes)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
